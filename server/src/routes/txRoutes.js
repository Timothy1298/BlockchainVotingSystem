const express = require('express');
const router = express.Router();
const { postTxReceipt } = require('../controllers/configController');
const { mandatory } = require('../middleware/auth');

router.use(mandatory);
router.post('/receipt', postTxReceipt);

module.exports = router;
