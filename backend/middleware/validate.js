const Joi = require('joi');
const schemas = {
  signup:   Joi.object({ name:Joi.string().min(2).max(60).required(), phone:Joi.string().pattern(/^\+?\d{9,15}$/).required(), pin:Joi.string().min(4).max(6).pattern(/^\d+$/).required(), role:Joi.string().valid('buyer','vendor','farmer','delivery','agent').required(), location:Joi.string().min(2).max(100).required() }),
  login:    Joi.object({ phone:Joi.string().required(), pin:Joi.string().required() }),
  listing:  Joi.object({ product:Joi.string().min(2).max(100).required(), category:Joi.string().valid('Vegetables','Fruits','Grains','Oils','Dairy','Meat','Beverages','Other').required(), price:Joi.number().positive().required(), unit:Joi.string().valid('kg','litre','crate','bundle','unit','bag','dozen').required(), quantity:Joi.number().integer().positive().required(), location:Joi.string().required(), lat:Joi.number().optional(), lng:Joi.number().optional(), description:Joi.string().max(500).optional(), draft:Joi.boolean().optional() }),
  order:    Joi.object({ listingId:Joi.string().required(), quantity:Joi.number().positive().required(), paymentMethod:Joi.string().valid('ecocash','innbucks','onemoney','cash').required(), deliveryAddress:Joi.string().optional() }),
  waitlist: Joi.object({ name:Joi.string().min(2).required(), phone:Joi.string().pattern(/^\+?\d{9,15}$/).required(), role:Joi.string().valid('buyer','vendor','farmer','delivery','agent').required(), zone:Joi.string().optional(), notes:Joi.string().max(300).optional() }),
};
exports.validate = name => (req, res, next) => {
  const schema = schemas[name];
  if (!schema) return next();
  const { error } = schema.validate(req.body, { abortEarly:false });
  if (!error) return next();
  const errors = error.details.reduce((acc,d) => { acc[d.context.key]=d.message.replace(/"/g,''); return acc; }, {});
  return res.status(422).json({ success:false, message:'Validation failed', errors });
};
