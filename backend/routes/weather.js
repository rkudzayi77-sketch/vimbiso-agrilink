const r = require('express').Router();
const c = require('../controllers/weatherController');
r.get('/', c.getForecast);
module.exports = r;
