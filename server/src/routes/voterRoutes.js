const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const voterController = require('../controllers/voterController');

router.get('/', auth, roles(['admin']), voterController.list);
router.put('/:id', auth, roles(['admin']), voterController.update);
router.delete('/:id', auth, roles(['admin']), voterController.remove);

module.exports = router;
