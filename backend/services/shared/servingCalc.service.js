/**
 * Normalizes an ingredient name using master ingredients, their configured aliases,
 * or standard singularization fallbacks (PRD § 19).
 */
function resolveCanonicalName(rawName, masterIngredients = []) {
  if (!rawName) return '';
  const clean = rawName.trim().toLowerCase();

  // 1. Direct match or alias match against Master Ingredients
  if (Array.isArray(masterIngredients) && masterIngredients.length > 0) {
    for (const mi of masterIngredients) {
      if (mi.name.toLowerCase() === clean) return mi.name;
      if (Array.isArray(mi.aliases)) {
        for (const alias of mi.aliases) {
          if (alias.toLowerCase() === clean) return mi.name;
        }
      }
    }
  }

  // 2. Singularization heuristics for common kitchen ingredients
  if (clean.endsWith('es') && clean.length > 4) {
    return clean.slice(0, -2); // tomatoes -> tomato, potatoes -> potato
  }
  if (clean.endsWith('s') && !clean.endsWith('ss') && clean.length > 3) {
    return clean.slice(0, -1); // onions -> onion, carrots -> carrot
  }

  return clean;
}

/**
 * Calculates scaled ingredient quantities based on guest count and aggregates by name and unit.
 * Base servings: 2.
 * Formula: qty * (guests / 2).
 */
function calculateScaledIngredients(dishesWithIngredients, guests, masterIngredients = []) {
  if (!guests || guests <= 0) guests = 2;
  const scaleFactor = guests / 2;
  const aggregated = new Map();

  for (const dish of dishesWithIngredients) {
    if (!dish || !Array.isArray(dish.ingredients)) continue;

    for (const ing of dish.ingredients) {
      if (!ing.name || typeof ing.qtyPer2 !== 'number') continue;

      const canonicalName = resolveCanonicalName(ing.name, masterIngredients);
      const normUnit = (ing.unit || '').trim().toLowerCase();
      const key = `${canonicalName.toLowerCase()}:::${normUnit}`;

      const scaledQty = Number((ing.qtyPer2 * scaleFactor).toFixed(2));

      if (aggregated.has(key)) {
        const existing = aggregated.get(key);
        existing.quantity = Number((existing.quantity + scaledQty).toFixed(2));
      } else {
        // Display with capitalized canonical title or original trimmed name
        const displayName = canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1);
        aggregated.set(key, {
          name: displayName,
          quantity: scaledQty,
          unit: ing.unit.trim(),
          notes: '',
        });
      }
    }
  }

  return Array.from(aggregated.values());
}

module.exports = {
  calculateScaledIngredients,
  resolveCanonicalName,
};
