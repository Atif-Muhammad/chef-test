/**
 * Matches dish allergens against user allergy list.
 * Output: array of objects with { dishId, dishName, conflictAllergen }
 */
function checkAllergyConflicts(dishes, userAllergies = []) {
  if (!Array.isArray(dishes) || !Array.isArray(userAllergies) || userAllergies.length === 0) {
    return [];
  }

  const normalizedUserAllergies = userAllergies.map((a) => a.trim().toLowerCase());
  const conflicts = [];

  for (const dish of dishes) {
    if (!dish || !Array.isArray(dish.allergens)) continue;

    for (const allergen of dish.allergens) {
      const normAllergen = allergen.trim().toLowerCase();
      if (normalizedUserAllergies.includes(normAllergen)) {
        conflicts.push({
          dishId: dish._id ? dish._id.toString() : dish.id,
          dishName: dish.name,
          conflictAllergen: allergen.trim(),
        });
      }
    }
  }

  return conflicts;
}

module.exports = {
  checkAllergyConflicts,
};
