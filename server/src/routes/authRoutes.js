// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { mandatory } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { createLimiter } = require('../middleware/rateLimiter');


const authLimiter = createLimiter({ windowMs: 60 * 1000, max: 10, message: 'Too many auth attempts, try again later.' });

// POST /api/auth/register
router.post(
	'/register',
	[
		body('fullName').notEmpty().withMessage('Full name required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
	],
	registerLimiter,
	authController.register
);

// POST /api/auth/login
router.post(
	'/login',
	[body('email').isEmail(), body('password').exists()],
	loginLimiter,
	authController.login
);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);


// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);


// GET /api/auth/me
router.get('/me', mandatory, authController.me);

// POST /api/auth/refresh
router.post('/refresh', [body('refreshToken').notEmpty().withMessage('refreshToken required')], authController.refresh);

// POST /api/auth/revoke
router.post('/revoke', [body('refreshToken').notEmpty().withMessage('refreshToken required')], authController.revoke);


module.exports = router;