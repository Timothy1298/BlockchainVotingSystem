const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(mandatory);

router.get('/', userController.getAllUsers);
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

module.exports = router;
