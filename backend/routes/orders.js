const r = require('express').Router();
const c = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate }           = require('../middleware/validate');
r.get('/',              protect, c.mine);
r.post('/',             protect, authorize('buyer','admin'), validate('order'), c.create);
r.patch('/:id/status',  protect, c.updateStatus);
r.post('/:id/confirm',  protect, authorize('buyer'), c.confirm);
module.exports = r;
