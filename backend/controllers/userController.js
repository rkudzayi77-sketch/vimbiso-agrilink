const User    = require('../models/User');
const { ok, fail } = require('../utils/response');
exports.getNearby = async (req,res,next) => {
  try {
    const q = { isActive:true, gpsShared:true, _id:{ $ne:req.user._id } };
    if (req.query.role) q.role = req.query.role;
    const users = await User.find(q).select('name role location lat lng trustScore avgRating isOnline lastSeen zone avatar');
    ok(res,{ users, total:users.length });
  } catch(e){ next(e); }
};
exports.updateProfile = async (req,res,next) => {
  try {
    const allowed = ['name','location','zone','bio','categories','gpsShared'];
    const updates = {};
    allowed.forEach(k=>{ if(req.body[k]!==undefined) updates[k]=req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id,updates,{new:true,runValidators:true});
    ok(res,{ user },'Profile updated');
  } catch(e){ next(e); }
};
exports.updateLocation = async (req,res,next) => {
  try {
    const { lat,lng } = req.body;
    await User.findByIdAndUpdate(req.user._id,{ lat,lng,lastSeen:new Date() });
    req.io?.to('nearby_watchers').emit('location_updated',{ userId:req.user._id, lat,lng,role:req.user.role });
    ok(res,null,'Location updated');
  } catch(e){ next(e); }
};
exports.rateUser = async (req,res,next) => {
  try {
    const { score,comment } = req.body;
    const target = await User.findById(req.params.id);
    if (!target) return fail(res,'User not found',404);
    target.ratings.push({ fromUser:req.user._id, score, comment });
    target.updateRating(); await target.save();
    ok(res,{ avgRating:target.avgRating });
  } catch(e){ next(e); }
};
