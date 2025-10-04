// server/src/controllers/supportController.js
module.exports = {
  contactSupport: async (req, res) => {
    const { name, email, message } = req.body;
    // TODO: Integrate with email service or ticketing system
    res.json({ message: 'Support request submitted (placeholder)', data: { name, email, message } });
  },

  getFAQ: async (req, res) => {
    // Example: Return static FAQ list
    res.json({
      faq: [
        { q: 'How do I reset my password?', a: 'Go to your profile and click "Reset Password".' },
        { q: 'How do I contact support?', a: 'Use the support form on this page.' },
        { q: 'How do I check election results?', a: 'Go to the Results tab in the dashboard.' },
      ]
    });
  },

  systemInfo: async (req, res) => {
    res.json({
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
    });
  },

  submitFeedback: async (req, res) => {
    const { user, feedback } = req.body;
    // TODO: Store feedback in DB or send to admin
    res.json({ message: 'Feedback submitted (placeholder)', data: { user, feedback } });
  },
};
