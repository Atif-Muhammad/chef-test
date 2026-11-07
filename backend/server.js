const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { setupReminderCron } = require('./utils/cron');

// Routes
const authRoutes = require('./routes/shared/auth.routes');
const dishRoutes = require('./routes/shared/dish.routes');
const dishController = require('./controllers/shared/dish.controller');
const userRoutes = require('./routes/user-routes/user.routes');
const adminRoutes = require('./routes/admin-routes/admin.routes');
const notificationRoutes = require('./routes/shared/notification.routes');

const app = express();

// Connect Database
connectDB();

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parsers & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file storage for dish images with explicit MIME types
if (express.static.mime && express.static.mime.define) {
  express.static.mime.define({
    'image/jpeg': ['jfif', 'jpe', 'jpeg', 'jpg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
  });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Master Allergens public/shared lookup
const Allergy = require('./models/shared/Allergy');
app.get('/api/allergens', async (req, res, next) => {
  try {
    const allergens = await Allergy.find().sort({ name: 1 });
    res.json({ allergens });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.get('/api/categories', dishController.getCategories);
app.use('/api/dishes', dishRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// User routes (mount under /api directly to handle /api/visits, /api/favourites, /api/users/profile)
const userRouterWrapper = express.Router();
userRouterWrapper.use('/users', userRoutes);
userRouterWrapper.use(userRoutes);
app.use('/api', userRouterWrapper);

// Global Error Handler
app.use(errorHandler);

// Setup Cron Jobs
setupReminderCron();

const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`PrivateChefMissy Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

module.exports = { app, server };
