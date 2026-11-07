const express = require('express');
const router = express.Router();
const userAuthController = require('../../controllers/user-controllers/auth.controller');
const adminAuthController = require('../../controllers/admin-controllers/auth.controller');
const { requireAuth, optionalAuth } = require('../../middleware/auth.middleware');

router.post('/register', userAuthController.register);
router.post('/login', userAuthController.login);
router.post('/admin-login', adminAuthController.adminLogin);
router.post('/logout', userAuthController.logout);
router.post('/refresh', userAuthController.refreshToken);
router.get('/me', optionalAuth, userAuthController.getMe);
router.post('/forgot-password', userAuthController.forgotPassword);
router.post('/reset-password', userAuthController.resetPassword);

module.exports = router;
