// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { mandatory } = require('../middleware/auth');

// POST /api/auth/register
router.post(
	'/register',
	[
		body('fullName').notEmpty().withMessage('Full name required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
	],
	authController.register
);

// POST /api/auth/login
router.post(
	'/login',
	[body('email').isEmail(), body('password').exists()],
	authController.login
);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);


// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);


// GET /api/auth/me
router.get('/me', mandatory, authController.me);


module.exports = router;