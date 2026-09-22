const r = require('express').Router();
const c = require('../controllers/priceController');
r.get('/',        c.getFair);
r.get('/demand',  c.getDemand);
module.exports = r;
