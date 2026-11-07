const Dish = require('../../models/shared/Dish');
const Ingredient = require('../../models/shared/Ingredient');
const { calculateScaledIngredients, resolveCanonicalName } = require('./servingCalc.service');

/**
 * Produces an isolated shopping list snapshot for a visit.
 * Fetches dish definitions and scales ingredients by guest count,
 * resolving duplicate ingredients via Master Ingredient identities (PRD § 18, 19).
 * Respects family-specific adjustedIngredients (substitutions/exclusions/custom quantities)
 * without touching original master recipes.
 */
async function generateShoppingListForVisit(visitDishesOrDishIds, guests) {
  const isVisitDishes =
    Array.isArray(visitDishesOrDishIds) &&
    visitDishesOrDishIds.length > 0 &&
    typeof visitDishesOrDishIds[0] === 'object' &&
    visitDishesOrDishIds[0].dishId;

  const dishIds = isVisitDishes
    ? visitDishesOrDishIds.map((vd) => (vd.dishId._id ? vd.dishId._id : vd.dishId))
    : visitDishesOrDishIds;

  const [dishes, masterIngredients] = await Promise.all([
    Dish.find({ _id: { $in: dishIds } }),
    Ingredient.find(),
  ]);

  if (!isVisitDishes) {
    return calculateScaledIngredients(dishes, guests, masterIngredients);
  }

  // If visit has adjustedIngredients, apply family-specific recipe overrides without altering master dishes
  const dishMap = new Map(dishes.map((d) => [d._id.toString(), d.toObject ? d.toObject() : d]));
  const customizedDishes = [];

  for (const vd of visitDishesOrDishIds) {
    const dishIdStr = (vd.dishId && vd.dishId._id ? vd.dishId._id : vd.dishId).toString();
    const baseDish = dishMap.get(dishIdStr);
    if (!baseDish) continue;

    const dishCopy = { ...baseDish };
    if (Array.isArray(vd.adjustedIngredients) && vd.adjustedIngredients.length > 0) {
      dishCopy.ingredients = vd.adjustedIngredients
        .filter((ing) => !ing.exclusion)
        .map((ing) => ({
          name: ing.substitution ? ing.substitution : ing.name,
          qtyPer2: ing.qty !== undefined && ing.qty !== null ? ing.qty : 1,
          unit: ing.unit || '',
        }));
    }
    customizedDishes.push(dishCopy);
  }

  return calculateScaledIngredients(customizedDishes, guests, masterIngredients);
}

/**
 * Combines shopping lists from multiple visits into a unified list.
 * Aggregates identical ingredients using canonical names and units.
 */
async function combineMultipleVisitShoppingLists(visits) {
  const masterIngredients = await Ingredient.find();
  const aggregated = new Map();

  for (const visit of visits) {
    if (!visit || !Array.isArray(visit.shoppingList)) continue;

    for (const item of visit.shoppingList) {
      if (!item.name || typeof item.quantity !== 'number') continue;

      const canonicalName = resolveCanonicalName(item.name, masterIngredients);
      const normUnit = (item.unit || '').trim().toLowerCase();
      const key = `${canonicalName.toLowerCase()}:::${normUnit}`;

      if (aggregated.has(key)) {
        const existing = aggregated.get(key);
        existing.quantity = Number((existing.quantity + item.quantity).toFixed(2));
        if (item.substitution && !existing.substitution.includes(item.substitution)) {
          existing.substitution = existing.substitution
            ? `${existing.substitution}, ${item.substitution}`
            : item.substitution;
        }
      } else {
        const displayName = canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1);
        aggregated.set(key, {
          name: displayName,
          quantity: item.quantity,
          unit: item.unit ? item.unit.trim() : '',
          substitution: item.substitution || '',
          notes: item.notes || '',
        });
      }
    }
  }

  return Array.from(aggregated.values());
}

module.exports = {
  generateShoppingListForVisit,
  combineMultipleVisitShoppingLists,
};
