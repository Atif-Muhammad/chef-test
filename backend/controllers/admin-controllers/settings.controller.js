const bcrypt = require('bcryptjs');
const Admin = require('../../models/admin-models/Admin');
const Visit = require('../../models/user-models/Visit');
const env = require('../../config/env');
const nodemailer = require('nodemailer');

exports.getSettings = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id).select('name email role_admin createdAt');
    
    // Check SMTP configuration
    const isSmtpConfigured = Boolean(env.SMTP_USER && env.SMTP_PASS);

    // Find visits in the next 7 days for reminder monitoring (PRD § 49)
    const now = new Date();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingVisits = await Visit.find({
      visitDate: { $gte: now, $lte: in7Days },
    })
      .populate('userId', 'name email')
      .select('visitDate guests status reminderSent userId')
      .sort({ visitDate: 1 });

    return res.json({
      admin,
      emailConfig: {
        isConfigured: isSmtpConfigured,
        provider: isSmtpConfigured ? 'Custom SMTP' : 'Development Mock Mailer',
        fromEmail: env.EMAIL_FROM,
        smtpHost: env.SMTP_HOST || 'localhost',
        smtpPort: env.SMTP_PORT,
      },
      upcomingReminders: upcomingVisits,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    if (name) admin.name = name.trim();
    if (email) admin.email = email.toLowerCase().trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    return res.json({
      message: 'Admin profile updated successfully.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.sendTestEmail = async (req, res, next) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || req.user.email;

    let transporter;
    if (env.SMTP_USER && env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      transporter = {
        sendMail: async () => ({ messageId: 'mock-test-' + Date.now() }),
      };
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: recipient,
      subject: 'Private Chef Missy - SMTP Diagnostic Test',
      text: `This is a test notification from Private Chef Missy administration portal dispatched at ${new Date().toISOString()}.`,
    });

    return res.json({ message: `Diagnostic email successfully dispatched to ${recipient}.` });
  } catch (err) {
    return res.status(500).json({ message: `Email delivery failed: ${err.message}` });
  }
};
