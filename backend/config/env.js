const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/private_chef_missy',
  JWT_SECRET: process.env.JWT_SECRET || 'pcm_super_secret_jwt_key_change_in_production',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'pcm_super_secret_jwt_key_change_in_production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'pcm_super_secret_refresh_jwt_key_30d_missy',
  ACCESS_TOKEN_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  ACCESS_COOKIE_NAME: 'pcm_access_token',
  REFRESH_COOKIE_NAME: 'pcm_refresh_token',
  COOKIE_NAME: 'pcm_access_token', // for backwards compatibility
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@privatechefmissy.com',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};
