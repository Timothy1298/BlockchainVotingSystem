const express = require('express');
const router = express.Router();
const { postTxReceipt } = require('../controllers/configController');
const auth = require('../middleware/auth');

router.post('/receipt', auth.optional, postTxReceipt);

module.exports = router;
