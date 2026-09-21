const DeliveryJob = require('../models/DeliveryJob');
const Order       = require('../models/Order');
const User        = require('../models/User');
const { ok, fail }= require('../utils/response');

exports.getJobs = async (req,res,next) => {
  try {
    const jobs = await DeliveryJob.find({ status:'auction', auctionExpiresAt:{ $gt:new Date() } }).populate('order vendor buyer').sort({ createdAt:-1 });
    ok(res,{ jobs, total:jobs.length });
  } catch(e){ next(e); }
};

exports.acceptJob = async (req,res,next) => {
  try {
    const job = await DeliveryJob.findOne({ _id:req.params.id, status:'auction', auctionExpiresAt:{ $gt:new Date() } });
    if (!job) return fail(res,'Job no longer available',404);
    job.status='assigned'; job.agent=req.user._id; job.acceptedAt=new Date();
    await job.save();
    await Order.findByIdAndUpdate(job.order,{ deliveryAgent:req.user._id, status:'in_transit' });
    req.io?.to(`user_${job.buyer}`).emit('rider_assigned',{ jobId:job._id, agent:req.user });
    ok(res,{ job },'Job accepted');
  } catch(e){ next(e); }
};

exports.completeJob = async (req,res,next) => {
  try {
    const job = await DeliveryJob.findOne({ _id:req.params.id, agent:req.user._id });
    if (!job) return fail(res,'Job not found',404);
    job.status='completed'; job.completedAt=new Date(); await job.save();
    await Order.findByIdAndUpdate(job.order,{ status:'delivered', deliveredAt:new Date() });
    req.io?.to(`user_${job.buyer}`).emit('delivery_arrived',{ orderId:job.order });
    ok(res,{ job },'Job completed. Awaiting buyer confirmation.');
  } catch(e){ next(e); }
};

exports.updateLocation = async (req,res,next) => {
  try {
    const { lat,lng,orderId } = req.body;
    await User.findByIdAndUpdate(req.user._id,{ lat,lng,lastSeen:new Date() });
    if (orderId) await Order.findByIdAndUpdate(orderId,{ riderLat:lat,riderLng:lng });
    req.io?.to(`order_${orderId}`).emit('rider_moved',{ lat,lng,agentId:req.user._id });
    ok(res,null,'Location updated');
  } catch(e){ next(e); }
};

exports.myJobs = async (req,res,next) => {
  try {
    const jobs = await DeliveryJob.find({ agent:req.user._id }).populate('order vendor buyer').sort({ createdAt:-1 });
    ok(res,{ jobs, total:jobs.length });
  } catch(e){ next(e); }
};

exports.toggleOnline = async (req,res,next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = !user.isOnline; user.lastSeen = new Date();
    await user.save({ validateBeforeSave:false });
    const event = user.isOnline ? 'agent_online' : 'agent_offline';
    req.io?.to('delivery_agents').emit(event,{ agentId:user._id });
    ok(res,{ isOnline:user.isOnline });
  } catch(e){ next(e); }
};
