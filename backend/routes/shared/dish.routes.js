const express = require('express');
const router = express.Router();
const dishController = require('../../controllers/shared/dish.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.get('/categories', dishController.getCategories);
router.get('/categories/all', dishController.getCategories);
router.get('/', optionalAuth, dishController.getDishes);
router.get('/:id', optionalAuth, dishController.getDishById);

module.exports = router;
