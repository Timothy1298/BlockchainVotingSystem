const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
router.use(requireRole(['admin', 'super_admin']));

// User Role Management
router.get('/user-roles', adminSettingsController.getUserRoles);
router.put('/user-roles', adminSettingsController.updateUserRole);

// External Integrations
router.get('/external-integrations', adminSettingsController.getExternalIntegrations);
router.put('/external-integrations', adminSettingsController.updateExternalIntegrations);
router.post('/test-integration/:type', adminSettingsController.testIntegration);

// Security Policies
router.get('/security-policies', adminSettingsController.getSecurityPolicies);
router.put('/security-policies', adminSettingsController.updateSecurityPolicies);

// System Maintenance
router.get('/system-maintenance', adminSettingsController.getSystemMaintenance);
router.post('/system-maintenance', adminSettingsController.performMaintenance);

// System Configuration
router.get('/system-configuration', adminSettingsController.getSystemConfiguration);
router.put('/system-configuration', adminSettingsController.updateSystemConfiguration);

module.exports = router;
