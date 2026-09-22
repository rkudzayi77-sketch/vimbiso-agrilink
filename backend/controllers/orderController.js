const Order       = require('../models/Order');
const Listing     = require('../models/Listing');
const Transaction = require('../models/Transaction');
const DeliveryJob = require('../models/DeliveryJob');
const User        = require('../models/User');
const { ok, fail }= require('../utils/response');
const { v4:uuidv4}= require('uuid');

exports.create = async (req,res,next) => {
  try {
    const { listingId,quantity,paymentMethod,deliveryAddress } = req.body;
    const listing = await Listing.findById(listingId).populate('vendor');
    if (!listing) return fail(res,'Listing not found',404);
    if (listing.quantity < quantity) return fail(res,'Insufficient stock',400);
    const subtotal    = +(listing.price * quantity).toFixed(2);
    const platformFee = +(subtotal * 0.03).toFixed(2);
    const deliveryFee = 1.80;
    const total       = +(subtotal + platformFee + deliveryFee).toFixed(2);
    const order = await Order.create({ buyer:req.user._id, vendor:listing.vendor._id, listing:listingId, product:listing.product, quantity, unitPrice:listing.price, subtotal, platformFee, deliveryFee, total, paymentMethod, deliveryAddress, escrowRef:`ESC-${uuidv4().slice(0,8).toUpperCase()}`, escrowStatus:'held', status:'pending' });
    await Transaction.create({ user:req.user._id, order:order._id, type:'escrow_hold', amount:total, description:`Escrow for ${listing.product}` });
    listing.quantity -= quantity; listing.orders = (listing.orders||0) + 1;
    await listing.save({ validateBeforeSave:false });
    const job = await DeliveryJob.create({ order:order._id, vendor:listing.vendor._id, buyer:req.user._id, product:listing.product, fromAddress:listing.location, fromLat:listing.lat, fromLng:listing.lng, toAddress:deliveryAddress||req.user.location, pay:deliveryFee, distance:2.3 });
    req.io?.to(`user_${listing.vendor._id}`).emit('new_order',{ order });
    req.io?.to('delivery_agents').emit('job_posted', job);
    ok(res,{ order, escrowRef:order.escrowRef },'Order placed. Payment secured in escrow.',201);
  } catch(e){ next(e); }
};

exports.mine = async (req,res,next) => {
  try {
    const { role } = req.query;
    const filter = role==='vendor'?{ vendor:req.user._id }:role==='delivery'?{ deliveryAgent:req.user._id }:{ buyer:req.user._id };
    const orders = await Order.find(filter).populate('vendor','name phone').populate('buyer','name phone').populate('deliveryAgent','name phone').sort({ createdAt:-1 });
    ok(res,{ orders, total:orders.length });
  } catch(e){ next(e); }
};

exports.updateStatus = async (req,res,next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res,'Order not found',404);
    order.status = req.body.status;
    if (req.body.status==='delivered') order.deliveredAt = new Date();
    await order.save();
    req.io?.to(`user_${order.buyer}`).emit('order_updated', order);
    req.io?.to(`user_${order.vendor}`).emit('order_updated', order);
    ok(res,{ order },'Status updated');
  } catch(e){ next(e); }
};

exports.confirm = async (req,res,next) => {
  try {
    const order = await Order.findOne({ _id:req.params.id, buyer:req.user._id });
    if (!order) return fail(res,'Order not found',404);
    if (order.status!=='delivered') return fail(res,'Not yet delivered',400);
    order.status='completed'; order.escrowStatus='released'; order.releasedAt=new Date();
    await order.save();
    const vendor = await User.findById(order.vendor);
    vendor.walletBalance += order.subtotal; vendor.totalTransactions++;
    await vendor.save({ validateBeforeSave:false });
    if (order.deliveryAgent) {
      const agent = await User.findById(order.deliveryAgent);
      agent.walletBalance += order.deliveryFee;
      await agent.save({ validateBeforeSave:false });
    }
    await Transaction.create({ user:order.vendor, order:order._id, type:'escrow_release', amount:order.subtotal, description:'Escrow released' });
    req.io?.to(`user_${order.vendor}`).emit('payment_released',{ orderId:order._id, amount:order.subtotal });
    ok(res,{ order },'Delivery confirmed. Payment released.');
  } catch(e){ next(e); }
};
