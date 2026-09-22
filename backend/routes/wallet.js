const r = require('express').Router();
const c = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
r.get('/balance',       protect, c.getBalance);
r.get('/transactions',  protect, c.getTransactions);
r.post('/withdraw',     protect, c.withdraw);
r.post('/loan',         protect, c.applyLoan);
module.exports = r;
