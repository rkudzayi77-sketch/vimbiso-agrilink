const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  order:       { type:mongoose.Schema.Types.ObjectId, ref:'Order', required:true },
  vendor:      { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  buyer:       { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  agent:       { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  product:     String, weight:String,
  fromAddress: String, fromLat:Number, fromLng:Number,
  toAddress:   String, toLat:Number, toLng:Number,
  distance:    Number,
  pay:         { type:Number, required:true },
  status:      { type:String, enum:['auction','assigned','in_progress','completed','expired'], default:'auction' },
  auctionExpiresAt: { type:Date, default:()=>new Date(Date.now()+120000) },
  acceptedAt:  Date, completedAt: Date,
}, { timestamps:true });
module.exports = mongoose.model('DeliveryJob', schema);
