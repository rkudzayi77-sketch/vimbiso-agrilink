exports.ok      = (res,data,msg='Success',code=200)  => res.status(code).json({ success:true,  message:msg, data });
exports.fail    = (res,msg='Error',code=400)          => res.status(code).json({ success:false, message:msg });
exports.paged   = (res,data,total,page,limit) =>
  res.json({ success:true, data, pagination:{ total, page:+page, limit:+limit, pages:Math.ceil(total/limit) } });
