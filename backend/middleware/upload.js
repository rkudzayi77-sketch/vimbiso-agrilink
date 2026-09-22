const multer = require('multer');
const path   = require('path');
const storage = multer.diskStorage({
  destination: (_,__,cb) => cb(null,'uploads/'),
  filename:    (_,file,cb) => cb(null,`${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`),
});
const filter = (_,file,cb) => {
  /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('Images only'));
};
exports.upload = multer({ storage, limits:{ fileSize:5*1024*1024 }, fileFilter:filter });
