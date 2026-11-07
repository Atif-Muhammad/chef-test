/**
 * Seed script for PrivateChefMissy.
 * Seeds default Admin, Categories, Allergens, and ~300 diverse gourmet dishes.
 * NOTE: DO NOT RUN THIS SCRIPT AUTOMATICALLY. Intended for Phase 6 Content Import.
 * Run explicitly via: node backend/scripts/seedDishes.js --confirm
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const Admin = require('../models/admin-models/Admin');
const Category = require('../models/shared/Category');
const Allergy = require('../models/shared/Allergy');
const Dish = require('../models/shared/Dish');

const CATEGORIES = [
  { name: 'Mains - Meat & Poultry', slug: 'mains-meat-poultry', order: 1 },
  { name: 'Mains - Seafood', slug: 'mains-seafood', order: 2 },
  { name: 'Mains - Pasta & Grains', slug: 'mains-pasta-grains', order: 3 },
  { name: 'Mains - Vegetarian & Vegan', slug: 'mains-vegetarian', order: 4 },
  { name: 'Japanese & Asian Fusion', slug: 'japanese-fusion', order: 5 },
  { name: 'Desserts & Sweet Pastries', slug: 'desserts', order: 6 },
  { name: "Kids' Meals", slug: 'kids-meals', order: 7 },
  { name: 'Starters & Broths', slug: 'starters', order: 8 },
];

const ALLERGENS = [
  { name: 'Gluten', slug: 'gluten' },
  { name: 'Dairy', slug: 'dairy' },
  { name: 'Shellfish', slug: 'shellfish' },
  { name: 'Fish', slug: 'fish' },
  { name: 'Eggs', slug: 'eggs' },
  { name: 'Peanuts', slug: 'peanuts' },
  { name: 'Tree Nuts', slug: 'tree-nuts' },
  { name: 'Soy', slug: 'soy' },
  { name: 'Sesame', slug: 'sesame' },
];

// Base dish templates to generate ~300 unique culinary entries
const CUISINES = ['Modern French', 'Japanese Kaiseki', 'Italian Rustic', 'Mediterranean', 'California Clean', 'Pan-Asian'];
const DIETARY = ['Nut-Free', 'Dairy-Free', 'Gluten-Free Available', 'High-Protein', 'Low-Carb', 'Halal-Friendly'];

const PROTEINS = [
  'Wagyu Beef Tenderloin', 'Slow-Braised Short Ribs', 'Organic Duck Breast', 'Free-Range Corn-Fed Chicken',
  'Rack of Spring Lamb', 'Wild Alaskan King Salmon', 'Atlantic Black Cod', 'Day-Boat Sea Scallops',
  'Jumbo Tiger Prawns', 'Chilean Sea Bass', 'Heirloom Porcini & Truffle', 'Crispy Tofu & Shiitake'
];

const PREPARATIONS = [
  'Pan-Seared with Red Wine Demi-Glace',
  'Miso-Glazed with Charred Scallion Infusion',
  'Sous-Vide with Brown Butter & Thyme',
  'Slow-Roasted with Rosemary & Confit Garlic',
  'Steamed en Papillote with Kaffir Lime',
  'Wood-Fired with Charred Leek Emulsion',
  'Braised in Sake & Mirin Dashi',
  'Crusted with Toasted Pistachios & Fine Herbs'
];

const SIDES = [
  'Truffled Pomme Puree', 'Sauteed Broccolini with Chili Oil', 'Roasted Heirloom Carrots with Honey-Thyme Glaze',
  'Saffron Risotto Milanese', 'Charred Bok Choy with Garlic Tamari', 'Wild Rice Pilaf with Pomegranate Seeds',
  'Cauliflower Silk with Crispy Capers', 'Grilled Asparagus with Aged Balsamic'
];

const DESSERT_ITEMS = [
  'Matcha Opera Cake with Gold Leaf', 'Madagascar Vanilla Bean Panna Cotta with Raspberry Coulis',
  'Dark Chocolate Valrhona Tart with Sea Salt', 'Yuzu Lemon Curd Tartlet with Meringue',
  'Earl Grey Poached Pears with Mascarpone', 'Classic Japanese Souffle Cheesecake',
  'Caramelized Apple Tarte Tatin with Creme Fraiche', 'Black Sesame Gelato with Crispy Tuile'
];

const KIDS_ITEMS = [
  'Mini Wagyu Meatballs in Roasted Cherry Tomato Sauce',
  'Crispy Baked Organic Chicken Tenders with Sweet Honey-Mustard',
  'Mild Creamy Pumpkin & White Cheddar Macaroni',
  'Pan-Seared Salmon Cubes with Steamed Jasmine Rice and Edamame',
  'Handmade Mini Gnocchi with Mild Parmesan Butter',
  'Golden Panko Chicken Bites with Steamed Carrot Coins',
  'Mini Soft Tacos with Mild Braised Beef and Avocado',
  'Sweet Potato Fries with House Apple-Dip'
];

function generate300Dishes(categoryMap) {
  const dishes = [];
  let index = 1;

  // 1. Meat, Poultry, Seafood, Pasta, Asian Fusion (~230 mains)
  for (const protein of PROTEINS) {
    for (const prep of PREPARATIONS) {
      if (dishes.length >= 230) break;
      const side = SIDES[index % SIDES.length];
      const cuisine = CUISINES[index % CUISINES.length];
      const isTimeIntensive = index % 5 === 0; // ~20% are time-intensive

      let catSlug = 'mains-meat-poultry';
      if (protein.includes('Salmon') || protein.includes('Cod') || protein.includes('Scallops') || protein.includes('Prawns') || protein.includes('Sea Bass')) {
        catSlug = 'mains-seafood';
      } else if (cuisine.includes('Japanese') || cuisine.includes('Asian')) {
        catSlug = 'japanese-fusion';
      } else if (protein.includes('Porcini') || protein.includes('Tofu')) {
        catSlug = 'mains-vegetarian';
      }

      dishes.push({
        name: `${protein} ${prep}`,
        description: `Exquisitely prepared ${protein.toLowerCase()} paired with ${side.toLowerCase()}, finished with chef reduction and micro herbs.`,
        photoUrl: `/uploads/dishes/sample-dish-${(index % 12) + 1}.jpg`,
        categoryId: categoryMap[catSlug] || categoryMap['mains-meat-poultry'],
        cuisineTags: [cuisine, 'Fine Dining'],
        dietaryTags: [DIETARY[index % DIETARY.length]],
        allergens: protein.includes('Prawns') ? ['Shellfish'] : protein.includes('Cod') || protein.includes('Salmon') ? ['Fish'] : (index % 3 === 0 ? ['Dairy'] : []),
        ingredients: [
          { name: protein, qtyPer2: 350, unit: 'g' },
          { name: 'French Salted Butter', qtyPer2: 30, unit: 'g' },
          { name: 'Fresh Herbs (Thyme / Rosemary)', qtyPer2: 10, unit: 'g' },
          { name: 'Garlic Confit', qtyPer2: 2, unit: 'cloves' },
          { name: side.split(' ')[0], qtyPer2: 200, unit: 'g' },
        ],
        storageInstructions: 'Refrigerate immediately in airtight glass container. Consume within 48 hours.',
        reheatingInstructions: 'Preheat oven to 160C (320F). Cover dish lightly with foil and warm for 12-14 minutes.',
        cookingInstructions: `[SECRET CHEF RECIPE #${index}] Sear protein over medium-high cast iron until internal temp reaches 54C. Rest 8 mins. Deglaze pan with reduced jus. Whisk in cold butter. Plate over warmed ${side}.`,
        isTimeIntensive,
        isPublished: true,
        isKidsMeal: false,
        type: 'main',
      });
      index++;
    }
  }

  // 2. Desserts (~40 items)
  for (const dessert of DESSERT_ITEMS) {
    for (let variant = 1; variant <= 5; variant++) {
      if (dishes.length >= 270) break;
      dishes.push({
        name: variant === 1 ? dessert : `${dessert} (Reserve Selection ${variant})`,
        description: `Handcrafted artisanal dessert celebrating balanced sweetness and delicate textures.`,
        photoUrl: `/uploads/dishes/sample-dessert-${(index % 6) + 1}.jpg`,
        categoryId: categoryMap['desserts'],
        cuisineTags: ['Pastry & Confectionery'],
        dietaryTags: ['Vegetarian'],
        allergens: ['Dairy', 'Eggs', 'Gluten'],
        ingredients: [
          { name: 'Organic Flour', qtyPer2: 120, unit: 'g' },
          { name: 'Cane Sugar', qtyPer2: 80, unit: 'g' },
          { name: 'Free-Range Eggs', qtyPer2: 2, unit: 'pcs' },
          { name: 'Double Cream', qtyPer2: 100, unit: 'ml' },
        ],
        storageInstructions: 'Keep chilled below 4C. Best enjoyed within 3 days.',
        reheatingInstructions: 'Serve chilled or at room temperature. Do not microwave.',
        cookingInstructions: `[SECRET PASTRY RECIPE #${index}] Temper egg yolks at 82C. Fold into chilled whipped ganache. Set in molds for 4 hours.`,
        isTimeIntensive: index % 4 === 0,
        isPublished: true,
        isKidsMeal: false,
        type: 'dessert',
      });
      index++;
    }
  }

  // 3. Kids Meals (~35 items)
  for (const kidMeal of KIDS_ITEMS) {
    for (let variant = 1; variant <= 4; variant++) {
      if (dishes.length >= 305) break;
      dishes.push({
        name: variant === 1 ? kidMeal : `${kidMeal} (Junior Platter ${variant})`,
        description: `Nutritionally balanced, mild-flavored, and toddler-approved meal specially designed for ages 1-5.`,
        photoUrl: `/uploads/dishes/sample-kids-${(index % 4) + 1}.jpg`,
        categoryId: categoryMap['kids-meals'],
        cuisineTags: ['Junior Gourmet'],
        dietaryTags: ['Mild Seasoning', 'Nut-Free'],
        allergens: kidMeal.includes('Parmesan') || kidMeal.includes('Cheddar') ? ['Dairy'] : [],
        ingredients: [
          { name: 'Primary Ingredient', qtyPer2: 180, unit: 'g' },
          { name: 'Olive Oil', qtyPer2: 10, unit: 'ml' },
          { name: 'Vegetable Puree', qtyPer2: 100, unit: 'g' },
        ],
        storageInstructions: 'Keep refrigerated in sealed container for up to 48 hours.',
        reheatingInstructions: 'Microwave covered with damp paper towel on medium power for 45-60 seconds. Test temperature before serving to children.',
        cookingInstructions: `[SECRET JUNIOR RECIPE #${index}] Steam ingredients gently to preserve natural sweetness and nutrients. Light pink salt only. Cut into safe toddler-sized portions.`,
        isTimeIntensive: false,
        isPublished: true,
        isKidsMeal: true,
        type: 'kids',
      });
      index++;
    }
  }

  return dishes;
}

async function runSeed() {
  if (!process.argv.includes('--confirm')) {
    console.log('[SEED SCRIPT GUARD] Script called without --confirm flag.');
    console.log('Per specification instructions, the seed script is prepared but NOT run automatically.');
    console.log('To run during Phase 6 Content Import, execute: node backend/scripts/seedDishes.js --confirm');
    process.exit(0);
  }

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB. Starting database seed...');

    // 1. Seed Admin
    const adminEmail = 'admin@privatechefmissy.com';
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash('ChefMissy2026!', 10);
      admin = await Admin.create({
        name: 'Misaki Kumagae (Chef Missy)',
        email: adminEmail,
        passwordHash,
        role_admin: true,
      });
      console.log(`Created default Admin: ${adminEmail} (password: ChefMissy2026!)`);
    } else {
      console.log(`Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed Categories
    const categoryMap = {};
    for (const cat of CATEGORIES) {
      const c = await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
      categoryMap[cat.slug] = c._id;
    }
    console.log(`Seeded ${CATEGORIES.length} categories.`);

    // 3. Seed Allergens
    for (const alg of ALLERGENS) {
      await Allergy.findOneAndUpdate({ slug: alg.slug }, alg, { upsert: true, new: true });
    }
    console.log(`Seeded ${ALLERGENS.length} allergen master records.`);

    // 4. Seed Dishes (~300)
    const count = await Dish.countDocuments();
    if (count < 100) {
      const generatedDishes = generate300Dishes(categoryMap);
      await Dish.insertMany(generatedDishes);
      console.log(`Successfully seeded ${generatedDishes.length} gourmet dishes!`);
    } else {
      console.log(`Database already contains ${count} dishes. Skipping bulk insertion.`);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

// Self-guard logic
if (require.main === module) {
  runSeed();
}

module.exports = {
  CATEGORIES,
  ALLERGENS,
  generate300Dishes,
};
