const Visit = require('../../models/user-models/Visit');
const User = require('../../models/user-models/User');
const Dish = require('../../models/shared/Dish');
const { checkAllergyConflicts } = require('../../services/shared/allergyFlag.service');
const {
  sendVisitStatusUpdateEmail,
  sendShoppingListSharedEmail,
  sendIncompleteAppointmentInvitation,
} = require('../../services/shared/email.service');
const { generateShoppingListForVisit } = require('../../services/shared/shoppingList.service');
const { createNotification, templates: notiTemplates } = require('../../services/shared/notification.service');

exports.getAllVisits = async (req, res, next) => {
  try {
    const { tab, startDate, endDate, search, status } = req.query;
    const query = {};

    // Date filtering based on tab & from-to params
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (tab === 'upcoming') {
      const dateFilter = {};
      if (startDate) {
        const s = new Date(startDate);
        dateFilter.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      } else {
        dateFilter.$gte = todayStart;
      }
      if (endDate) {
        const e = new Date(endDate);
        dateFilter.$lte = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      }
      query.visitDate = dateFilter;
    } else if (tab === 'past') {
      const dateFilter = {};
      const yesterdayEnd = new Date(todayStart.getTime() - 1);

      let endBound = yesterdayEnd;
      if (endDate) {
        const e = new Date(endDate);
        endBound = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      }
      dateFilter.$lte = endBound;

      if (startDate) {
        const s = new Date(startDate);
        dateFilter.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date(endBound.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter.$gte = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate(), 0, 0, 0, 0);
      }
      query.visitDate = dateFilter;
    } else if (startDate || endDate) {
      // All visits with explicit date filter
      const dateFilter = {};
      if (startDate) {
        const s = new Date(startDate);
        dateFilter.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      }
      if (endDate) {
        const e = new Date(endDate);
        dateFilter.$lte = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      }
      query.visitDate = dateFilter;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search query across client details, dish names, and reservation notes
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');

      const [matchingUsers, matchingDishes] = await Promise.all([
        User.find({
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
            { location: regex },
          ],
        }).select('_id'),
        Dish.find({ name: regex }).select('_id'),
      ]);

      const userIds = matchingUsers.map((u) => u._id);
      const dishIds = matchingDishes.map((d) => d._id);

      const orConditions = [
        { notes: regex },
        { chefNotes: regex },
        { specialRequests: regex },
        { arrivalWindow: regex },
      ];
      if (userIds.length > 0) orConditions.push({ userId: { $in: userIds } });
      if (dishIds.length > 0) orConditions.push({ 'dishes.dishId': { $in: dishIds } });

      query.$or = orConditions;
    }

    let sortOrder = { visitDate: -1 };
    if (tab === 'upcoming' || (startDate && (!endDate || new Date(endDate) >= now))) {
      sortOrder = { visitDate: 1 };
    }

    const visits = await Visit.find(query)
      .populate('userId', 'name email phone location dietaryPreferences allergies dislikedIngredients specialRequests adultsCount childrenCount childrenAges')
      .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type')
      .sort(sortOrder);

    // Attach computed allergy flags for each visit
    const visitsWithAllergyFlags = visits.map((visit) => {
      const visitObj = visit.toObject();
      const userAllergies = visit.userId ? visit.userId.allergies : [];
      const dishes = (visit.dishes || []).map((d) => d.dishId).filter(Boolean);
      visitObj.allergyFlags = checkAllergyConflicts(dishes, userAllergies);
      return visitObj;
    });

    return res.json({ visits: visitsWithAllergyFlags });
  } catch (err) {
    next(err);
  }
};

exports.scheduleVisitForClient = async (req, res, next) => {
  try {
    const {
      clientId,
      visitDate,
      adults = 2,
      children = 0,
      childrenAges = '',
      arrivalWindow = '',
      chefNotes = '',
      notes = '',
      specialRequests = '',
      dishes = [],
    } = req.body;

    if (!clientId || !visitDate) {
      return res.status(400).json({ message: 'Client and visit date are required.' });
    }

    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const adultsNum = Math.max(1, parseInt(adults, 10) || 2);
    const childrenNum = Math.max(0, parseInt(children, 10) || 0);
    const guests = adultsNum + childrenNum;

    // Process dishes if provided by admin
    let visitDishes = [];
    let shoppingListSnapshot = [];
    if (Array.isArray(dishes) && dishes.length > 0) {
      if (dishes.length > 7) {
        return res.status(400).json({ message: 'Maximum 7 dishes allowed per visit.' });
      }

      const dishIds = dishes.map((d) => (typeof d === 'object' ? d.dishId || d._id : d));
      const dbDishes = await Dish.find({ _id: { $in: dishIds } });
      const dishMap = new Map(dbDishes.map((d) => [d._id.toString(), d]));

      // Check time-intensive dishes
      let timeIntensiveCount = 0;
      for (const id of dishIds) {
        const d = dishMap.get(id.toString());
        if (d && d.isTimeIntensive) timeIntensiveCount++;
      }
      if (timeIntensiveCount > 2) {
        return res.status(400).json({ message: 'Maximum 2 time-intensive dishes allowed per visit.' });
      }

      visitDishes = dishIds.map((id) => {
        const d = dishMap.get(id.toString());
        return {
          dishId: id,
          course: d?.type || 'main',
        };
      });

      shoppingListSnapshot = await generateShoppingListForVisit(dishIds, guests);
    }

    const visit = await Visit.create({
      userId: client._id,
      visitDate: new Date(visitDate),
      adults: adultsNum,
      children: childrenNum,
      childrenAges: (childrenAges || '').trim(),
      guests,
      arrivalWindow: (arrivalWindow || '').trim(),
      chefNotes: (chefNotes || '').trim(),
      notes: (notes || '').trim(),
      specialRequests: (specialRequests || notes || '').trim(),
      preparedBy: 'Chef Missy',
      scheduledByAdmin: true,
      status: 'pending',
      dishes: visitDishes,
      shoppingList: shoppingListSnapshot,
    });

    // Check if any core details are missing
    const hasDishes = visitDishes.length > 0;
    const missingDetails = [];
    if (!hasDishes) {
      missingDetails.push('Menu & dish selections (choose up to 7 courses)');
    }
    if (childrenNum > 0 && !childrenAges.trim()) {
      missingDetails.push('Children ages');
    }
    if (!notes.trim() && !specialRequests.trim()) {
      missingDetails.push('Dietary notes & preparation requests (optional)');
    }

    let emailSent = false;
    // Condition 2:
    // i. If ALL details are already put/filled by admin (has dishes selected), then NO email is sent upon creation.
    // ii. If details are missing (e.g. no dishes selected yet), send an invitation email asking user to fill in with deep link.
    if (!hasDishes) {
      if (client.email) {
        sendIncompleteAppointmentInvitation(client, visit, missingDetails).catch((err) =>
          console.error('[EMAIL ERROR] Failed to send appointment invitation email:', err.message)
        );
        emailSent = true;
      }
      createNotification(notiTemplates.clientPartialCreated({ client, visit })).catch((err) =>
        console.error('[NOTIFICATION ERROR] Failed to create partial appointment notification:', err.message)
      );
    }

    const populated = await Visit.findById(visit._id)
      .populate('userId', 'name email phone location dietaryPreferences allergies dislikedIngredients specialRequests')
      .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type');

    return res.status(201).json({
      message: hasDishes
        ? 'Appointment created with full menu selection. Confirmation email will be sent when you confirm the appointment.'
        : 'Appointment scheduled. Invitation email sent to client with direct link to choose their menu.',
      visit: populated,
      emailSent,
    });
  } catch (err) {
    next(err);
  }
};

exports.adjustVisitRecipes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dishes, notes, specialRequests } = req.body;
    const visit = await Visit.findById(id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    if (Array.isArray(dishes)) {
      visit.dishes = dishes.map((d) => ({
        dishId: d.dishId._id || d.dishId,
        course: d.course || 'main',
        customNotes: d.customNotes || '',
        adjustedIngredients: Array.isArray(d.adjustedIngredients) ? d.adjustedIngredients : [],
      }));
    }
    if (notes !== undefined) visit.notes = notes;
    if (specialRequests !== undefined) visit.specialRequests = specialRequests;

    // Re-generate shopping list based on family adjusted ingredients
    const updatedList = await generateShoppingListForVisit(visit.dishes, visit.guests);
    visit.shoppingList = updatedList;

    await visit.save();

    const populated = await Visit.findById(id)
      .populate('userId', 'name email phone location dietaryPreferences allergies dislikedIngredients')
      .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type');

    return res.json({
      message: 'Family-specific recipe adjustments saved successfully.',
      visit: populated,
    });
  } catch (err) {
    next(err);
  }
};

exports.shareShoppingListWithClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findById(id).populate('userId', 'name email phone location');
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    visit.shoppingListShared = true;
    await visit.save();

    if (visit.userId && visit.userId.email) {
      sendShoppingListSharedEmail(visit.userId, visit, visit.shoppingList).catch((err) =>
        console.error('[EMAIL ERROR] Failed to send shopping list email:', err.message)
      );
    }

    if (visit.userId) {
      createNotification(notiTemplates.clientShoppingListShared({ client: visit.userId, visit })).catch((err) =>
        console.error('[NOTIFICATION ERROR] Failed to create shopping list notification:', err.message)
      );
    }

    return res.json({
      message: 'Shopping list successfully shared with client. Email confirmation sent.',
      visit,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, arrivalWindow, chefNotes, cancellationReason, visitDate } = req.body;

    const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const visit = await Visit.findById(id).populate('userId', 'name email phone location');
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    if (status === 'cancelled' && (visit.status === 'confirmed' || visit.status === 'ready')) {
      return res.status(400).json({
        message: 'Confirmed or ready dining appointments cannot be declined.',
      });
    }

    if (status) visit.status = status;
    if (visitDate) visit.visitDate = new Date(visitDate);
    if (arrivalWindow !== undefined) visit.arrivalWindow = arrivalWindow.trim();
    if (chefNotes !== undefined) visit.chefNotes = chefNotes.trim();
    if (cancellationReason !== undefined) visit.cancellationReason = cancellationReason.trim();

    if (status === 'cancelled') {
      visit.cancelledBy = 'admin';
    }

    await visit.save();

    // Send automated email notification via Nodemailer asynchronously (for confirmation, ready & cancellation)
    if (visit.userId && visit.userId.email && (status === 'confirmed' || status === 'ready' || status === 'cancelled')) {
      sendVisitStatusUpdateEmail(visit.userId, visit, status).catch((err) =>
        console.error('[EMAIL ERROR] Failed to send visit status email:', err.message)
      );
    }

    // Send automated in-system notifications for status transitions
    if (visit.userId) {
      if (status === 'confirmed') {
        createNotification(notiTemplates.clientOrderConfirmed({ client: visit.userId, visit })).catch((err) =>
          console.error('[NOTIFICATION ERROR] Failed to send confirmed notification:', err.message)
        );
      } else if (status === 'ready') {
        createNotification(notiTemplates.clientOrderReady({ client: visit.userId, visit })).catch((err) =>
          console.error('[NOTIFICATION ERROR] Failed to send ready notification:', err.message)
        );
      } else if (status === 'completed') {
        createNotification(notiTemplates.clientOrderCompleted({ client: visit.userId, visit })).catch((err) =>
          console.error('[NOTIFICATION ERROR] Failed to send completed notification:', err.message)
        );
      } else if (status === 'cancelled') {
        createNotification(notiTemplates.clientOrderCancelled({ client: visit.userId, visit })).catch((err) =>
          console.error('[NOTIFICATION ERROR] Failed to send cancelled notification:', err.message)
        );
      }
    }

    // Re-populate with dishes to return updated representation
    const updated = await Visit.findById(id)
      .populate('userId', 'name email phone location dietaryPreferences allergies dislikedIngredients specialRequests adultsCount childrenCount childrenAges')
      .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type');

    const visitObj = updated.toObject();
    const userAllergies = visitObj.userId ? visitObj.userId.allergies : [];
    const dishes = (visitObj.dishes || []).map((d) => d.dishId).filter(Boolean);
    visitObj.allergyFlags = checkAllergyConflicts(dishes, userAllergies);

    return res.json({
      message: `Visit marked as ${visit.status}. Client notified.`,
      visit: visitObj,
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientAllergyProfiles = async (req, res, next) => {
  try {
    const clients = await User.find()
      .select('name email phone location photoUrl dob gender dietaryPreferences allergies dislikedIngredients adultsCount childrenCount childrenAges specialRequests status favouriteDishes createdAt')
      .populate({
        path: 'favouriteDishes',
        select: 'name photoUrl allergens isTimeIntensive type spiceLevel categoryId tags',
        populate: { path: 'categoryId', select: 'name slug' },
      })
      .sort({ name: 1 });

    const clientStats = await Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        const visitCount = await Visit.countDocuments({ userId: client._id });
        const lastVisit = await Visit.findOne({ userId: client._id }).sort({ visitDate: -1 }).select('visitDate status');
        clientObj.visitCount = visitCount;
        clientObj.lastVisitDate = lastVisit ? lastVisit.visitDate : null;
        clientObj.favouriteDishes = clientObj.favouriteDishes || [];
        clientObj.favouriteCount = clientObj.favouriteDishes.length;
        return clientObj;
      })
    );

    return res.json({ clients: clientStats });
  } catch (err) {
    next(err);
  }
};

exports.getClientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await User.findById(id)
      .select(
        'name email phone location photoUrl dob gender dietaryPreferences allergies dislikedIngredients specialRequests status createdAt'
      )
      .lean();

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const [totalVisitsCount, latestVisit] = await Promise.all([
      Visit.countDocuments({ userId: id }),
      Visit.findOne({ userId: id }).sort({ visitDate: -1 }).select('visitDate arrivalWindow').lean(),
    ]);

    return res.json({
      client,
      totalVisits: totalVisitsCount,
      latestVisit: latestVisit || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientFavourites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await User.findById(id)
      .select('favouriteDishes')
      .populate({
        path: 'favouriteDishes',
        select: 'name photoUrl allergens isTimeIntensive type spiceLevel categoryId description tags',
        populate: { path: 'categoryId', select: 'name slug' },
      })
      .lean();

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    return res.json({
      favourites: client.favouriteDishes || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientVisits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const client = await User.findById(id).select('allergies').lean();
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const visitFilter = { userId: id };
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        const s = new Date(startDate);
        dateFilter.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      }
      if (endDate) {
        const e = new Date(endDate);
        dateFilter.$lte = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      }
      visitFilter.visitDate = dateFilter;
    }

    const [visits, totalVisitsCount] = await Promise.all([
      Visit.find(visitFilter)
        .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type')
        .sort({ visitDate: -1 })
        .lean(),
      Visit.countDocuments({ userId: id }),
    ]);

    const enrichedVisits = visits.map((v) => {
      const dishes = (v.dishes || []).map((d) => d.dishId).filter(Boolean);
      return {
        ...v,
        allergyFlags: checkAllergyConflicts(dishes, client.allergies || []),
      };
    });

    return res.json({
      visits: enrichedVisits,
      totalVisits: totalVisitsCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const client = await User.findById(id)
      .select(
        'name email phone location photoUrl dob gender dietaryPreferences allergies dislikedIngredients adultsCount childrenCount childrenAges specialRequests status favouriteDishes createdAt'
      )
      .populate({
        path: 'favouriteDishes',
        select: 'name photoUrl allergens isTimeIntensive type spiceLevel categoryId description tags',
        populate: { path: 'categoryId', select: 'name slug' },
      });
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const visitFilter = { userId: id };
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        const s = new Date(startDate);
        dateFilter.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      }
      if (endDate) {
        const e = new Date(endDate);
        dateFilter.$lte = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      }
      visitFilter.visitDate = dateFilter;
    }

    const [visits, totalVisitsCount] = await Promise.all([
      Visit.find(visitFilter)
        .populate('dishes.dishId', 'name photoUrl allergens isTimeIntensive type')
        .sort({ visitDate: -1 }),
      Visit.countDocuments({ userId: id }),
    ]);

    const now = new Date();
    const upcomingVisits = [];
    const pastVisits = [];

    visits.forEach((v) => {
      const visitObj = v.toObject();
      const dishes = (v.dishes || []).map((d) => d.dishId).filter(Boolean);
      visitObj.allergyFlags = checkAllergyConflicts(dishes, client.allergies || []);

      if (new Date(v.visitDate) >= now) {
        upcomingVisits.push(visitObj);
      } else {
        pastVisits.push(visitObj);
      }
    });

    return res.json({
      client,
      favourites: client.favouriteDishes || [],
      upcomingVisits,
      pastVisits,
      totalVisits: totalVisitsCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateClientStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'terminated'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'active' or 'terminated'." });
    }

    const client = await User.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    client.status = status;
    await client.save();

    return res.json({
      message: `Client status updated to ${status}.`,
      client: {
        _id: client._id,
        name: client.name,
        email: client.email,
        status: client.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
