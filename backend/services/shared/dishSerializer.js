/**
 * Privacy serializer for Dishes.
 * Guarantees that clients and public users never receive:
 * - qtyPer2 (ingredient quantities)
 * - cookingInstructions (private chef recipe instructions)
 */
function serializeDish(dish, isAdmin = false) {
  if (!dish) return null;

  const dishObj = typeof dish.toObject === 'function' ? dish.toObject() : { ...dish };

  if (isAdmin) {
    dishObj.baseServings = dishObj.baseServings || 2;
    return dishObj;
  }

  // Ensure base servings is always 2
  dishObj.baseServings = 2;

  // Strip secret admin recipe instructions
  delete dishObj.cookingInstructions;

  // Ingredients: include name, qtyPer2 (quantity for base 2 servings), and unit
  if (Array.isArray(dishObj.ingredients)) {
    dishObj.ingredients = dishObj.ingredients.map((ing) => ({
      name: ing.name,
      qtyPer2: ing.qtyPer2,
      unit: ing.unit,
    }));
  }

  return dishObj;
}

function serializeDishes(dishes, isAdmin = false) {
  if (!Array.isArray(dishes)) return [];
  return dishes.map((dish) => serializeDish(dish, isAdmin));
}

module.exports = {
  serializeDish,
  serializeDishes,
};
