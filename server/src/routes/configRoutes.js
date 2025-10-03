const express = require('express');
const router = express.Router();
const { getConfig, postTxReceipt } = require('../controllers/configController');
const auth = require('../middleware/auth');

router.get('/', getConfig);
// Accept receipts; require auth if you want to restrict to logged-in users (optional)
router.post('/receipt', auth.optional, postTxReceipt);

module.exports = router;
