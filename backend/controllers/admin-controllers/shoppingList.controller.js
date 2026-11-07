const Visit = require('../../models/user-models/Visit');
const {
  generateShoppingListForVisit,
  combineMultipleVisitShoppingLists,
} = require('../../services/shared/shoppingList.service');

exports.getVisitShoppingList = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('userId', 'name email phone location dietaryPreferences allergies dislikedIngredients specialRequests adultsCount childrenCount childrenAges')
      .populate('dishes.dishId', 'name photoUrl isTimeIntensive allergens');

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    return res.json({
      visitId: visit._id,
      visitDate: visit.visitDate,
      adults: visit.adults,
      children: visit.children,
      childrenAges: visit.childrenAges,
      guests: visit.guests,
      status: visit.status,
      arrivalWindow: visit.arrivalWindow,
      chefNotes: visit.chefNotes,
      specialRequests: visit.specialRequests,
      shoppingListShared: visit.shoppingListShared,
      client: visit.userId,
      dishes: visit.dishes,
      shoppingList: visit.shoppingList,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Regenerates the shopping list using current dish definitions, family-adjusted ingredients,
 * master ingredients, and guests count, while preserving existing custom substitutions and notes.
 */
exports.regenerateVisitShoppingList = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    // Pass visit.dishes to respect adjustedIngredients overrides without altering master dishes
    const freshSnapshot = await generateShoppingListForVisit(visit.dishes, visit.guests);

    // Merge existing substitutions and manual notes if ingredient names match
    const existingMap = new Map();
    (visit.shoppingList || []).forEach((item) => {
      existingMap.set(item.name.toLowerCase().trim(), item);
    });

    const mergedList = freshSnapshot.map((item) => {
      const match = existingMap.get(item.name.toLowerCase().trim());
      if (match) {
        return {
          ...item,
          substitution: match.substitution || '',
          notes: match.notes || '',
          adminAdjustment: match.adminAdjustment || false,
        };
      }
      return item;
    });

    visit.shoppingList = mergedList;
    await visit.save();

    return res.json({
      message: 'Shopping list successfully recalculated from recipes.',
      shoppingList: visit.shoppingList,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates shopping list items for this visit only without altering master dish recipe.
 */
exports.updateVisitShoppingList = async (req, res, next) => {
  try {
    const { shoppingList } = req.body;
    if (!Array.isArray(shoppingList)) {
      return res.status(400).json({ message: 'shoppingList must be an array of items.' });
    }

    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    // Mutate the isolated snapshot on the visit document
    visit.shoppingList = shoppingList;
    await visit.save();

    return res.json({
      message: 'Shopping list updated for visit.',
      shoppingList: visit.shoppingList,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Aggregates shopping lists across multiple selected visits for bulk purchasing (PRD § 18, 19).
 */
exports.getCombinedMultiVisitShoppingList = async (req, res, next) => {
  try {
    const { visitIds } = req.body;
    if (!Array.isArray(visitIds) || visitIds.length === 0) {
      return res.status(400).json({ message: 'visitIds array is required.' });
    }

    const visits = await Visit.find({ _id: { $in: visitIds } })
      .populate('userId', 'name email location')
      .populate('dishes.dishId', 'name photoUrl');

    const combinedList = await combineMultipleVisitShoppingLists(visits);

    return res.json({
      combinedShoppingList: combinedList,
      visitsCount: visits.length,
      visits: visits.map((v) => ({
        id: v._id,
        clientName: v.userId?.name,
        visitDate: v.visitDate,
        guests: v.guests,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Copies a shopping list snapshot from a previous visit into a target visit.
 * Enables quick prefill of customized ingredients, quantities, and substitutions.
 */
exports.copyShoppingListFromVisit = async (req, res, next) => {
  try {
    const { id } = req.params; // target visit ID
    const { sourceVisitId } = req.body;

    if (!sourceVisitId) {
      return res.status(400).json({ message: 'sourceVisitId is required.' });
    }

    const [targetVisit, sourceVisit] = await Promise.all([
      Visit.findById(id),
      Visit.findById(sourceVisitId),
    ]);

    if (!targetVisit) return res.status(404).json({ message: 'Target visit not found.' });
    if (!sourceVisit) return res.status(404).json({ message: 'Source visit not found.' });

    if (!Array.isArray(sourceVisit.shoppingList) || sourceVisit.shoppingList.length === 0) {
      return res.status(400).json({ message: 'Source visit has no shopping list items to copy.' });
    }

    // Clone items into the target visit
    targetVisit.shoppingList = sourceVisit.shoppingList.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      substitution: item.substitution || '',
      notes: item.notes || '',
      adminAdjustment: true,
    }));

    await targetVisit.save();

    return res.json({
      message: 'Shopping list successfully copied from previous visit.',
      shoppingList: targetVisit.shoppingList,
      sourceVisitDate: sourceVisit.visitDate,
    });
  } catch (err) {
    next(err);
  }
};
