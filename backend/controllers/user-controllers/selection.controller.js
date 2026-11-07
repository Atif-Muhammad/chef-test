const Visit = require('../../models/user-models/Visit');
const Dish = require('../../models/shared/Dish');
const User = require('../../models/user-models/User');
const { generateShoppingListForVisit } = require('../../services/shared/shoppingList.service');
const { sendSubmissionConfirmation } = require('../../services/shared/email.service');
const { checkAllergyConflicts } = require('../../services/shared/allergyFlag.service');
const { createNotification, templates: notiTemplates } = require('../../services/shared/notification.service');

// Helper to calculate date range across UTC and local timezones
function getDateBounds(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
    const utcStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const utcEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    const localStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    const localEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
    return {
      start: new Date(Math.min(utcStart.getTime(), localStart.getTime())),
      end: new Date(Math.max(utcEnd.getTime(), localEnd.getTime())),
    };
  }
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

exports.createVisitSelection = async (req, res, next) => {
  try {
    const {
      visitId,
      visitDate,
      arrivalWindow = '',
      adults = 2,
      children = 0,
      childrenAges = '',
      specialRequests = '',
      notes = '',
      dishes,
    } = req.body;

    let targetVisit = null;
    let parsedDate = null;

    if (visitId) {
      targetVisit = await Visit.findOne({ _id: visitId, userId: req.user.id });
      if (!targetVisit) {
        return res.status(404).json({ message: 'Pre-scheduled visit not found.' });
      }
      parsedDate = visitDate ? new Date(visitDate) : targetVisit.visitDate;
    } else {
      if (!visitDate) {
        return res.status(400).json({ message: 'Visit date is required.' });
      }
      parsedDate = new Date(visitDate);
      // Also lookup existing visit by date for this user
      const { start, end } = getDateBounds(visitDate);
      targetVisit = await Visit.findOne({
        userId: req.user.id,
        visitDate: { $gte: start, $lte: end },
        status: { $ne: 'cancelled' },
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (isNaN(parsedDate.getTime()) || parsedDate < todayStart) {
      return res.status(400).json({ message: 'Visit date must be a valid future or current date.' });
    }

    // 48-Hour advance deadline enforcement (Requirement 2 & PRD § 25, 46 - relaxed if scheduled by admin)
    const hoursUntilVisit = (parsedDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilVisit < 48 && (!targetVisit || !targetVisit.scheduledByAdmin)) {
      return res.status(400).json({
        message: 'Menu selections must be submitted at least 48 hours prior to the scheduled visit date.',
      });
    }

    const adultsNum = Math.max(1, parseInt(adults, 10) || 2);
    const childrenNum = Math.max(0, parseInt(children, 10) || 0);
    const guestsNum = adultsNum + childrenNum;

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ message: 'At least one dish must be selected.' });
    }

    // Maximum 7 dishes total limit per visit (Requirement 2 & 14)
    if (dishes.length > 7) {
      return res.status(400).json({
        message: `Maximum 7 dishes allowed per visit. (Selected: ${dishes.length})`,
      });
    }

    const dishIds = dishes.map((d) => d.dishId);
    const dbDishes = await Dish.find({ _id: { $in: dishIds }, isPublished: true });

    if (dbDishes.length !== dishIds.length) {
      return res.status(400).json({ message: 'One or more selected dishes are invalid or unpublished.' });
    }

    const dishMap = new Map(dbDishes.map((d) => [d._id.toString(), d]));

    // Maximum 2 time-intensive dishes (30+ min prep) limit per visit (Requirement 2 & 15)
    let timeIntensiveCount = 0;
    for (const item of dishes) {
      const dbDish = dishMap.get(item.dishId.toString());
      if (dbDish && dbDish.isTimeIntensive) {
        timeIntensiveCount++;
      }
    }

    if (timeIntensiveCount > 2) {
      return res.status(400).json({
        message: `Maximum 2 time-intensive dishes (30+ min prep) allowed per visit. (Selected: ${timeIntensiveCount})`,
      });
    }

    // Generate isolated shopping list snapshot
    const shoppingListSnapshot = await generateShoppingListForVisit(dishIds, guestsNum);

    let visit;
    if (targetVisit) {
      if (parsedDate) {
        targetVisit.visitDate = parsedDate;
      }
      targetVisit.adults = adultsNum;
      targetVisit.children = childrenNum;
      targetVisit.childrenAges = childrenAges.trim();
      targetVisit.guests = guestsNum;
      if (arrivalWindow && arrivalWindow.trim()) {
        targetVisit.arrivalWindow = arrivalWindow.trim();
      }
      targetVisit.specialRequests = specialRequests.trim() || notes.trim();
      targetVisit.notes = notes.trim();
      targetVisit.dishes = dishes.map((d) => ({
        dishId: d.dishId,
        course: dishMap.get(d.dishId.toString()).type || 'main',
      }));
      targetVisit.shoppingList = shoppingListSnapshot;
      targetVisit.status = 'pending';
      targetVisit.reminderSent = false;
      await targetVisit.save();
      visit = targetVisit;
    } else {
      visit = await Visit.create({
        userId: req.user.id,
        visitDate: parsedDate,
        adults: adultsNum,
        children: childrenNum,
        childrenAges: childrenAges.trim(),
        guests: guestsNum,
        arrivalWindow: (arrivalWindow || '').trim(),
        specialRequests: specialRequests.trim() || notes.trim(),
        notes: notes.trim(),
        preparedBy: 'Chef Missy',
        dishes: dishes.map((d) => ({
          dishId: d.dishId,
          course: dishMap.get(d.dishId.toString()).type || 'main',
        })),
        shoppingList: shoppingListSnapshot,
        status: 'pending',
        reminderSent: false,
      });
    }

    // Allergy conflict check
    const user = await User.findById(req.user.id);
    const allergyWarnings = checkAllergyConflicts(dbDishes, user ? user.allergies : []);

    // Send confirmation email asynchronously via Nodemailer
    if (user) {
      const emailDishes = dishes.map((d) => ({
        name: dishMap.get(d.dishId.toString()).name,
        course: dishMap.get(d.dishId.toString()).type || 'main',
      }));
      sendSubmissionConfirmation(user, visit, emailDishes).catch((err) =>
        console.error('Failed to send confirmation email:', err.message)
      );

      // In-system notifications: Admin alert (deep-linked) and client confirmation
      createNotification(notiTemplates.adminNewOrder({ client: user, visit, dishes })).catch((err) =>
        console.error('Failed to create admin order notification:', err.message)
      );
      createNotification(notiTemplates.clientOrderSubmitted({ client: user, visit })).catch((err) =>
        console.error('Failed to create client order notification:', err.message)
      );
    }

    return res.status(201).json({
      visit,
      allergyWarnings,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVisitHistory = async (req, res, next) => {
  try {
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    const total = await Visit.countDocuments(query);

    let findQuery = Visit.find(query)
      .sort({ visitDate: -1 })
      .populate({
        path: 'dishes.dishId',
        select: 'name description photoUrl cuisineTags dietaryTags allergens type isTimeIntensive spiceLevel',
      });

    if (isPaginated) {
      findQuery = findQuery.skip(skip).limit(limit);
    }

    const visits = await findQuery.select(
      '_id visitDate adults children guests arrivalWindow status dishes chefNotes notes specialRequests cancellationReason cancelledBy createdAt'
    );

    return res.json({
      visits,
      total,
      page: isPaginated ? page : 1,
      hasMore: isPaginated ? skip + visits.length < total : false,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVisitByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required.' });
    }

    const { start, end } = getDateBounds(date);
    const visit = await Visit.findOne({
      userId: req.user.id,
      visitDate: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    }).populate({
      path: 'dishes.dishId',
      select: 'name description photoUrl cuisineTags dietaryTags allergens type isTimeIntensive spiceLevel',
    });

    if (!visit) {
      return res.json({ visit: null, isPartial: false, isPast: false });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isPast = new Date(visit.visitDate) < todayStart;

    const hasDishes = Array.isArray(visit.dishes) && visit.dishes.length > 0;
    const hasWindow = Boolean(
      visit.arrivalWindow &&
      !visit.arrivalWindow.toLowerCase().includes('confirm') &&
      !visit.arrivalWindow.toLowerCase().includes('tbd') &&
      visit.arrivalWindow.trim().length > 0
    );
    const isPartial = Boolean(
      !hasDishes ||
      !hasWindow ||
      (visit.scheduledByAdmin && visit.status === 'pending' && !hasDishes)
    );

    const visitObj = visit.toObject();
    if (!visitObj.shoppingListShared) {
      delete visitObj.shoppingList;
    }

    return res.json({
      visit: visitObj,
      isPartial,
      isPast,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findOne({ _id: id, userId: req.user.id }).populate({
      path: 'dishes.dishId',
      select: 'name description photoUrl cuisineTags dietaryTags allergens type isTimeIntensive spiceLevel',
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    // Only expose shoppingList to client if shared by Chef Missy
    const visitObj = visit.toObject();
    if (!visitObj.shoppingListShared) {
      delete visitObj.shoppingList;
    }

    return res.json({ visit: visitObj });
  } catch (err) {
    next(err);
  }
};

exports.cancelVisitSelection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const visit = await Visit.findOne({ _id: id, userId: req.user.id });
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    if (visit.status === 'completed') {
      return res.status(400).json({ message: 'Completed dining visits cannot be cancelled.' });
    }
    if (visit.status === 'cancelled') {
      return res.status(400).json({ message: 'This visit has already been cancelled.' });
    }

    visit.status = 'cancelled';
    visit.cancelledBy = 'client';
    visit.cancellationReason = reason ? reason.trim() : 'Cancelled by client';
    await visit.save();

    return res.json({
      message: 'Visit reservation successfully cancelled.',
      visit,
    });
  } catch (err) {
    next(err);
  }
};
