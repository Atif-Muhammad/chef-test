const cron = require('node-cron');
const Visit = require('../models/user-models/Visit');
const User = require('../models/user-models/User');
const { sendVisitReminder } = require('../services/shared/email.service');

function setupReminderCron() {
  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily 48h visit reminder check...');
    try {
      const now = new Date();
      // Target: visits occurring within the next 48 to 72 hours, or where 48h threshold has arrived and reminder not sent
      const threshold48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const eligibleVisits = await Visit.find({
        visitDate: { $lte: threshold48h, $gte: now },
        reminderSent: false,
        status: { $in: ['pending', 'confirmed'] },
      }).populate('userId');

      for (const visit of eligibleVisits) {
        if (!visit.userId) continue;

        try {
          await sendVisitReminder(visit.userId, visit);
          visit.reminderSent = true;
          await visit.save();
          console.log(`[CRON] Reminder sent to ${visit.userId.email} for visit ${visit._id}`);
        } catch (sendErr) {
          console.error(`[CRON ERROR] Failed sending reminder for visit ${visit._id}:`, sendErr.message);
        }
      }
    } catch (err) {
      console.error('[CRON ERROR] Visit reminder job encountered an error:', err);
    }
  });

  console.log('[CRON] 48h reminder cron job scheduled.');
}

module.exports = {
  setupReminderCron,
};
