const r = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
r.use(protect, authorize('admin'));
r.get('/stats',               c.getStats);
r.get('/users',               c.getAllUsers);
r.patch('/users/:id/deactivate', c.deactivate);
module.exports = r;
