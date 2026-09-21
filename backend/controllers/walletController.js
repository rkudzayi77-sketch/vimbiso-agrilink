const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const TrustLoan   = require('../models/TrustLoan');
const { ok, fail, paged } = require('../utils/response');
const { v4:uuid } = require('uuid');

exports.getBalance = async (req,res,next) => {
  try {
    const u = await User.findById(req.user._id).select('walletBalance escrowBalance');
    ok(res,{ walletBalance:u.walletBalance, escrowBalance:u.escrowBalance });
  } catch(e){ next(e); }
};

exports.getTransactions = async (req,res,next) => {
  try {
    const {page=1,limit=20}=req.query;
    const filter={user:req.user._id};
    const total=await Transaction.countDocuments(filter);
    const txns=await Transaction.find(filter).populate('order','product').sort({createdAt:-1}).skip((page-1)*limit).limit(+limit);
    paged(res,txns,total,page,limit);
  } catch(e){ next(e); }
};

exports.withdraw = async (req,res,next) => {
  try {
    const { amount,method,accountNumber } = req.body;
    const u = await User.findById(req.user._id);
    if (u.walletBalance < amount) return fail(res,'Insufficient balance',400);
    u.walletBalance -= amount; await u.save({ validateBeforeSave:false });
    const txn = await Transaction.create({ user:req.user._id, type:'debit', amount, method, description:`Withdrawal to ${method} — ${accountNumber}`, status:'pending' });
    ok(res,{ transaction:txn, newBalance:u.walletBalance });
  } catch(e){ next(e); }
};

exports.applyLoan = async (req,res,next) => {
  try {
    const { amount } = req.body;
    const u = await User.findById(req.user._id);
    if (u.trustScore < 70) return fail(res,'Trust Score 70+ required for TrustLoan',403);
    const fee = +(amount * 0.05).toFixed(2);
    const totalRepayable = +(amount + fee).toFixed(2);
    const ref = `VBL-${uuid().slice(0,8).toUpperCase()}`;
    const loan = await TrustLoan.create({ user:req.user._id, amount, fee, totalRepayable, reference:ref });
    u.walletBalance += amount; await u.save({ validateBeforeSave:false });
    await Transaction.create({ user:req.user._id, type:'loan_credit', amount, description:`TrustLoan ${ref}`, reference:ref });
    ok(res,{ loan, newBalance:u.walletBalance },'Loan approved and credited',201);
  } catch(e){ next(e); }
};
