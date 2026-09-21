const User = require('../models/User');
const { sendToken } = require('../utils/jwt');
const { ok, fail }  = require('../utils/response');

exports.signup = async (req,res,next) => {
  try {
    const { name,phone,pin,role,location,zone } = req.body;
    if (await User.findOne({ phone })) return fail(res,'Account with this phone already exists',409);
    const user = await User.create({ name,phone,pin,role,location,zone:zone||'Harare East' });
    sendToken(user,201,res);
  } catch(e){ next(e); }
};

exports.login = async (req,res,next) => {
  try {
    const { phone,pin } = req.body;
    const user = await User.findOne({ phone }).select('+pin');
    if (!user || !(await user.comparePin(pin))) return fail(res,'Incorrect phone or PIN',401);
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave:false });
    sendToken(user,200,res);
  } catch(e){ next(e); }
};

exports.googleAuth = async (req,res,next) => {
  try {
    const { googleId,email,name } = req.body;
    let user = await User.findOne({ googleId }) || await User.findOne({ email });
    if (!user) return res.status(206).json({ success:false, requiresProfile:true, googleId, email, name });
    if (!user.googleId) { user.googleId=googleId; user.authProvider='linked'; await user.save({ validateBeforeSave:false }); }
    sendToken(user,200,res);
  } catch(e){ next(e); }
};

exports.completeProfile = async (req,res,next) => {
  try {
    const { googleId,email,name,role,location,zone } = req.body;
    if (!name?.trim()||!location?.trim()||!role) return fail(res,'Name, location and role required',422);
    const user = await User.create({ name,email,googleId,role,location,zone:zone||'Harare East',authProvider:'google' });
    sendToken(user,201,res);
  } catch(e){ next(e); }
};

exports.linkAccount = async (req,res,next) => {
  try {
    const { phone,pin,googleId,email } = req.body;
    const user = await User.findOne({ phone }).select('+pin');
    if (!user) return fail(res,'No account found',404);
    if (!(await user.comparePin(pin))) return fail(res,'Incorrect PIN',401);
    user.googleId=googleId; user.email=email; user.authProvider='linked';
    await user.save({ validateBeforeSave:false });
    sendToken(user,200,res);
  } catch(e){ next(e); }
};

exports.getMe  = (req,res) => ok(res,{ user:req.user });
exports.logout = (_,res)   => ok(res,null,'Logged out');
