const bcrypt = require('bcryptjs');
const Admin = require('../../models/admin-models/Admin');
const {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookie,
} = require('../../middleware/auth.middleware');

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const accessToken = signAccessToken(admin, 'admin');
    const refreshToken = signRefreshToken(admin, 'admin');
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.adminLogout = (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Admin logged out successfully.' });
};
