const express = require('express');
const router = express.Router();
const dishAdminController = require('../../controllers/admin-controllers/dish.controller');
const shoppingListController = require('../../controllers/admin-controllers/shoppingList.controller');
const clientController = require('../../controllers/admin-controllers/client.controller');
const ingredientController = require('../../controllers/admin-controllers/ingredient.controller');
const allergenController = require('../../controllers/admin-controllers/allergen.controller');
const settingsController = require('../../controllers/admin-controllers/settings.controller');
const analyticsController = require('../../controllers/admin-controllers/analytics.controller');
const uploadController = require('../../controllers/shared/upload.controller');
const upload = require('../../middleware/upload.middleware');
const { requireAdmin } = require('../../middleware/auth.middleware');

// All admin routes require admin role
router.use(requireAdmin);

const Dish = require('../../models/shared/Dish');

// Middleware to preload dish for dynamic dish-name folder upload
const loadDishForUpload = async (req, res, next) => {
  try {
    if (req.params.id) {
      const dish = await Dish.findById(req.params.id);
      if (dish) req.dish = dish;
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Dish management
router.get('/dishes', dishAdminController.getAllDishesAdmin);
router.post('/dishes', dishAdminController.createDish);
router.get('/dishes/:id', dishAdminController.getDishByIdAdmin);
router.put('/dishes/:id', dishAdminController.updateDish);
router.delete('/dishes/:id', dishAdminController.deleteDish);
router.post('/dishes/:id/photos', loadDishForUpload, upload.array('photos', 3), dishAdminController.updateDishPhotos);
router.post('/dishes/:id/photo', loadDishForUpload, upload.array('photos', 3), dishAdminController.updateDishPhotos);

// Category management
router.get('/categories', dishAdminController.getCategories);
router.post('/categories', dishAdminController.createCategory);
router.put('/categories/:id', dishAdminController.updateCategory);
router.delete('/categories/:id', dishAdminController.deleteCategory);

// Master Ingredients management (PRD § 19, 28, 38)
router.get('/ingredients', ingredientController.getIngredients);
router.post('/ingredients', ingredientController.createIngredient);
router.put('/ingredients/:id', ingredientController.updateIngredient);
router.delete('/ingredients/:id', ingredientController.deleteIngredient);

// Master Allergens management (PRD § 7, 28, 38)
router.get('/allergens', allergenController.getAllergens);
router.post('/allergens', allergenController.createAllergen);
router.put('/allergens/:id', allergenController.updateAllergen);
router.delete('/allergens/:id', allergenController.deleteAllergen);

// Visits & Shopping list management
router.get('/visits', clientController.getAllVisits);
router.post('/visits/schedule', clientController.scheduleVisitForClient);
router.patch('/visits/:id/status', clientController.updateVisitStatus);
router.put('/visits/:id/adjust-recipes', clientController.adjustVisitRecipes);
router.get('/visits/:id/shopping-list', shoppingListController.getVisitShoppingList);
router.patch('/visits/:id/shopping-list', shoppingListController.updateVisitShoppingList);
router.post('/visits/:id/shopping-list/regenerate', shoppingListController.regenerateVisitShoppingList);
router.post('/visits/:id/shopping-list/copy', shoppingListController.copyShoppingListFromVisit);
router.post('/visits/:id/shopping-list/share', clientController.shareShoppingListWithClient);
router.post('/shopping-list/multi', shoppingListController.getCombinedMultiVisitShoppingList);

// Client allergy profiles & client management (PRD § 32)
router.get('/clients', clientController.getClientAllergyProfiles);
router.get('/clients/:id/profile', clientController.getClientProfile);
router.get('/clients/:id/favourites', clientController.getClientFavourites);
router.get('/clients/:id/visits', clientController.getClientVisits);
router.get('/clients/:id', clientController.getClientDetail);
router.patch('/clients/:id/status', clientController.updateClientStatus);

// Standalone image upload helper
router.post('/upload', upload.single('photo'), uploadController.uploadPhoto);
router.post('/upload-multiple', upload.array('photos', 3), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files provided.' });
  }
  const photoUrls = req.files.map((f) => `/uploads/dishes/${f.filename}`);
  return res.status(201).json({
    message: 'Files uploaded successfully.',
    photoUrls,
  });
});

// Settings & Diagnostic tools (PRD § 26, 28 #10, 49)
router.get('/settings', settingsController.getSettings);
router.put('/settings/profile', settingsController.updateAdminProfile);
router.post('/settings/test-email', settingsController.sendTestEmail);

// Analytics & Dashboard aggregations
router.get('/analytics/stats', analyticsController.getStats);
router.get('/analytics/trends', analyticsController.getTrends);
router.get('/analytics/popular-dishes', analyticsController.getPopularDishes);
router.get('/analytics/recent-submissions', analyticsController.getRecentSubmissions);
router.get('/analytics/dietary-preferences', analyticsController.getDietaryPreferences);
router.get('/analytics/dashboard', analyticsController.getDashboardAnalytics);

module.exports = router;
