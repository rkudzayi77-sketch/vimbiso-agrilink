const r = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/auth');
r.get('/nearby',       protect, c.getNearby);
r.patch('/profile',    protect, c.updateProfile);
r.post('/location',    protect, c.updateLocation);
r.post('/:id/rate',    protect, c.rateUser);
module.exports = r;
