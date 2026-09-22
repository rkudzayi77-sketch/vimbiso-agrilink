const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  buyer:         { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  vendor:        { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  listing:       { type:mongoose.Schema.Types.ObjectId, ref:'Listing', required:true },
  product:       String,
  quantity:      { type:Number, required:true },
  unitPrice:     { type:Number, required:true },
  subtotal:      { type:Number, required:true },
  platformFee:   { type:Number, required:true },
  deliveryFee:   { type:Number, default:1.80 },
  total:         { type:Number, required:true },
  status:        { type:String, enum:['pending','accepted','rejected','in_transit','delivered','completed','disputed','refunded'], default:'pending' },
  escrowStatus:  { type:String, enum:['pending','held','released','refunded'], default:'pending' },
  escrowRef:     String,
  paymentMethod: { type:String, enum:['ecocash','innbucks','onemoney','cash'], default:'ecocash' },
  deliveryAgent: { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  deliveryAddress: String,
  deliveredAt:   Date,
  confirmedAt:   Date,
  releasedAt:    Date,
  notes:         String,
  disputeReason: String,
}, { timestamps:true });
orderSchema.index({ buyer:1, status:1 });
orderSchema.index({ vendor:1, status:1 });
module.exports = mongoose.model('Order', orderSchema);
