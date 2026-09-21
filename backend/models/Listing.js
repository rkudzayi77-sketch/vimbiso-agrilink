const mongoose = require('mongoose');
const listingSchema = new mongoose.Schema({
  vendor:      { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  product:     { type:String, required:true, trim:true },
  category:    { type:String, required:true, enum:['Vegetables','Fruits','Grains','Oils','Dairy','Meat','Beverages','Other'] },
  price:       { type:Number, required:true, min:0 },
  unit:        { type:String, default:'kg', enum:['kg','litre','crate','bundle','unit','bag','dozen'] },
  quantity:    { type:Number, required:true, min:0 },
  location:    { type:String, required:true },
  zone:        { type:String, default:'Harare East' },
  lat:         Number, lng: Number,
  images:      [String],
  description: { type:String, maxlength:500 },
  draft:       { type:Boolean, default:false },
  active:      { type:Boolean, default:true },
  expiresAt:   { type:Date, default:()=>new Date(Date.now()+24*60*60*1000) },
  views:       { type:Number, default:0 },
}, { timestamps:true });
listingSchema.index({ zone:1, active:1 });
listingSchema.index({ category:1 });
module.exports = mongoose.model('Listing', listingSchema);
