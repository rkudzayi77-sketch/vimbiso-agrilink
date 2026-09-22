const r = require('express').Router();
const c = require('../controllers/waitlistController');
const { protect, authorize } = require('../middleware/auth');
const { validate }           = require('../middleware/validate');
r.post('/',                validate('waitlist'), c.submit);
r.get('/',                 protect, authorize('admin'), c.getAll);
r.patch('/:id/contacted',  protect, authorize('admin'), c.markContacted);
r.delete('/:id',           protect, authorize('admin'), c.remove);
module.exports = r;
