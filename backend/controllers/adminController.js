const User        = require('../models/User');
const Listing     = require('../models/Listing');
const Order       = require('../models/Order');
const Waitlist    = require('../models/Waitlist');
const Transaction = require('../models/Transaction');
const { ok }      = require('../utils/response');

exports.getStats = async (_,res,next) => {
  try {
    const [users,listings,orders,waitlist,revenue] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments({ active:true }),
      Order.countDocuments(),
      Waitlist.countDocuments(),
      Transaction.aggregate([{ $match:{ type:'escrow_release' } },{ $group:{ _id:null, total:{ $sum:'$amount' } } }]),
    ]);
    const byRole = await User.aggregate([{ $group:{ _id:'$role', count:{ $sum:1 } } }]);
    const todayOrders = await Order.countDocuments({ createdAt:{ $gte:new Date(Date.now()-86400000) } });
    ok(res,{ users, listings, orders, waitlist, revenue:revenue[0]?.total||0, byRole, todayOrders });
  } catch(e){ next(e); }
};

exports.getAllUsers = async (req,res,next) => {
  try {
    const {page=1,limit=50,role}=req.query;
    const filter=role?{role}:{};
    const total=await User.countDocuments(filter);
    const users=await User.find(filter).sort({createdAt:-1}).skip((page-1)*limit).limit(+limit);
    ok(res,{ users, total });
  } catch(e){ next(e); }
};

exports.deactivate = async (req,res,next) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id,{isActive:false},{new:true});
    ok(res,{ user:u },'User deactivated');
  } catch(e){ next(e); }
};
