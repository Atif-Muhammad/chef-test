const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user-models/User');
const env = require('../../config/env');
const {
  signAccessToken,
  signRefreshToken,
  extractTokens,
  setAuthCookies,
  clearAuthCookie,
} = require('../../middleware/auth.middleware');
const { sendPasswordResetEmail } = require('../../services/shared/email.service');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, allergies } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      allergies: Array.isArray(allergies) ? allergies : [],
      role_client: true,
    });

    const accessToken = signAccessToken(user, 'client');
    const refreshToken = signRefreshToken(user, 'client');
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        role: 'client',
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'terminated') {
      return res.status(403).json({
        message: 'Your account has been terminated by administrator. Access revoked.',
        terminated: true,
      });
    }

    const accessToken = signAccessToken(user, 'client');
    const refreshToken = signRefreshToken(user, 'client');
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl || '',
        allergies: user.allergies,
        status: user.status || 'active',
        role: 'client',
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid email enumeration
      return res.json({ message: 'If an account exists, a password reset link has been dispatched.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour validity
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    return res.json({ message: 'If an account exists, a password reset link has been dispatched.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const accessToken = signAccessToken(user, 'client');
    const refreshToken = signRefreshToken(user, 'client');
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      message: 'Password successfully updated!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        role: 'client',
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = extractTokens(req);
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    let account = null;

    if (decoded.role === 'admin') {
      const Admin = require('../../models/admin-models/Admin');
      const admin = await Admin.findById(decoded.id).select('-passwordHash');
      if (admin) account = { id: admin._id, name: admin.name, email: admin.email, role: 'admin' };
    } else {
      const client = await User.findById(decoded.id).select('-passwordHash');
      if (client) {
        if (client.status === 'terminated') {
          return res.status(403).json({
            message: 'Your account has been terminated by administrator. Access revoked.',
            terminated: true,
          });
        }
        account = { id: client._id, name: client.name, email: client.email, role: 'client', status: client.status || 'active' };
      }
    }

    if (!account) {
      return res.status(401).json({ message: 'Account associated with session no longer exists.' });
    }

    const newAccessToken = signAccessToken(account, account.role);
    const newRefreshToken = signRefreshToken(account, account.role);
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
      role: account.role,
      user: account,
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully.' });
};

exports.getMe = (req, res) => {
  if (req.userTerminated || (req.user && req.user.role === 'client' && (req.user.status === 'terminated' || req.user.status !== 'active'))) {
    clearAuthCookie(res);
    return res.status(403).json({
      message: 'Your account has been terminated by administrator. Access revoked.',
      terminated: true,
      status: 'terminated',
    });
  }
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  return res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      photoUrl,
      allergies,
      phone,
      location,
      dob,
      gender,
      dietaryPreferences,
      dislikedIngredients,
      adultsCount,
      childrenCount,
      childrenAges,
      specialRequests,
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name !== undefined) user.name = name.trim();
    if (photoUrl !== undefined) user.photoUrl = photoUrl.trim();
    if (Array.isArray(allergies)) user.allergies = allergies;
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (dob !== undefined) user.dob = dob.trim();
    if (gender !== undefined) user.gender = gender.trim();
    if (Array.isArray(dietaryPreferences)) user.dietaryPreferences = dietaryPreferences;
    if (Array.isArray(dislikedIngredients)) user.dislikedIngredients = dislikedIngredients;
    if (adultsCount !== undefined) user.adultsCount = Math.max(1, parseInt(adultsCount, 10) || 2);
    if (childrenCount !== undefined) user.childrenCount = Math.max(0, parseInt(childrenCount, 10) || 0);
    if (childrenAges !== undefined) user.childrenAges = childrenAges.trim();
    if (specialRequests !== undefined) user.specialRequests = specialRequests.trim();

    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        photoUrl: user.photoUrl || '',
        dob: user.dob,
        gender: user.gender,
        dietaryPreferences: user.dietaryPreferences,
        dislikedIngredients: user.dislikedIngredients,
        adultsCount: user.adultsCount,
        childrenCount: user.childrenCount,
        childrenAges: user.childrenAges,
        specialRequests: user.specialRequests,
        allergies: user.allergies,
        role: 'client',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const clientId = String(req.user.id || req.user._id);
    const relativeUrl = `/uploads/clients/${clientId}/${req.file.filename}`;

    const user = await User.findById(clientId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Clean up old avatar file from disk if present
    if (user.photoUrl && user.photoUrl.startsWith('/uploads/clients/')) {
      const oldPath = path.join(__dirname, '..', '..', user.photoUrl.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn('Could not delete old avatar:', e.message);
        }
      }
    }

    user.photoUrl = relativeUrl;
    await user.save();

    return res.json({
      message: 'Profile photo updated successfully.',
      photoUrl: relativeUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        photoUrl: user.photoUrl,
        dob: user.dob,
        gender: user.gender,
        dietaryPreferences: user.dietaryPreferences,
        dislikedIngredients: user.dislikedIngredients,
        adultsCount: user.adultsCount,
        childrenCount: user.childrenCount,
        childrenAges: user.childrenAges,
        specialRequests: user.specialRequests,
        allergies: user.allergies,
        role: 'client',
      },
    });
  } catch (err) {
    next(err);
  }
};
