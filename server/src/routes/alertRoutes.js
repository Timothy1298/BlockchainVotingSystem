// alertRoute.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { mandatory } = require('../middleware/auth');

// Define the critical placeholder text you want to filter out
const PLACEHOLDER_MESSAGE = "Vinculum apud toties. Laborum vado concedo basium acerbitas deprimo aveho placeat cubo sed.";

// Define the custom alert message you want to display
const CUSTOM_SECURITY_ALERT = {
    _id: "CRITICAL_SYSTEM_OVERRIDE", // Use a unique ID that won't conflict with DB
    message: "System integrity check failed. Core services offline.",
    type: "CRITICAL",
    createdAt: new Date().getTime(),
    read: false,
    forAdmin: true
};

// GET /api/alerts
router.get('/', mandatory, async (req, res) => {
  try {
    // 1. Fetch alerts from the database
    let dbAlerts = await Notification.find().sort({ createdAt: -1 }).limit(10).lean();
    
    // 2. Filter out the specific placeholder message
    dbAlerts = dbAlerts.filter(alert => alert.message !== PLACEHOLDER_MESSAGE);
    
    // 3. Check if the placeholder was the *only* critical alert.
    //    We prepend the custom message to the top of the alerts array.
    
    const finalAlerts = [CUSTOM_SECURITY_ALERT, ...dbAlerts];

    // 4. Send the final, clean list of alerts
    res.json({ alerts: finalAlerts });
  } catch (err) {
    // If the database connection fails, at least show the custom alert
    res.status(200).json({ alerts: [CUSTOM_SECURITY_ALERT] });
  }
});

module.exports = router;