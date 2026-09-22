const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:        { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  order:       { type:mongoose.Schema.Types.ObjectId, ref:'Order' },
  type:        { type:String, enum:['credit','debit','escrow_hold','escrow_release','withdrawal','loan_credit','loan_repay','referral_reward'], required:true },
  amount:      { type:Number, required:true },
  description: String,
  reference:   String,
  method:      String,
  status:      { type:String, enum:['pending','completed','failed'], default:'completed' },
}, { timestamps:true });
module.exports = mongoose.model('Transaction', schema);
