const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET','POST'] },
});

// Attach io to every request
app.use((req,_,next) => { req.io=io; next(); });

// ── MIDDLEWARE ────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));
app.use(cors({ origin: process.env.CLIENT_URL||'*', credentials:true }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true, limit:'10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs:15*60*1000, max:200, message:{success:false,message:'Too many requests'} });
const authLim  = rateLimit({ windowMs:15*60*1000, max:20,  message:{success:false,message:'Too many auth attempts'} });
app.use('/api/', limiter);

// ── ROUTES ────────────────────────────────────────────────────────────
app.use('/api/auth',       authLim, require('./routes/auth'));
app.use('/api/users',               require('./routes/users'));
app.use('/api/listings',            require('./routes/listings'));
app.use('/api/orders',              require('./routes/orders'));
app.use('/api/deliveries',          require('./routes/deliveries'));
app.use('/api/waitlist',            require('./routes/waitlist'));
app.use('/api/wallet',              require('./routes/wallet'));
app.use('/api/admin',               require('./routes/admin'));
app.use('/api/prices',              require('./routes/prices'));
app.use('/api/weather',             require('./routes/weather'));
app.use('/uploads',    express.static('uploads'));

// Health check
app.get('/api/health', (_,res) => res.json({
  success:true, status:'healthy',
  version:'1.0.0', env:process.env.NODE_ENV,
  timestamp:new Date().toISOString(),
  uptime: Math.round(process.uptime()) + 's',
}));

// 404
app.use((_,res) => res.status(404).json({success:false,message:'Route not found'}));

// Error handler
app.use((err,_,res,__) => {
  console.error('❌',err.message);
  res.status(err.statusCode||500).json({
    success:false, message:err.message||'Internal server error',
    ...(process.env.NODE_ENV==='development'&&{stack:err.stack}),
  });
});

// ── SOCKET.IO ─────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('🔌 Connected:', socket.id);
  socket.on('join_room',              room  => socket.join(room));
  socket.on('rider_location_update',  data  => io.to(`order_${data.orderId}`).emit('rider_moved', data));
  socket.on('order_status_change',    data  => {
    io.to(`user_${data.buyerId}`).emit('order_updated', data);
    io.to(`user_${data.vendorId}`).emit('order_updated', data);
  });
  socket.on('new_job_available', data => io.to('delivery_agents').emit('job_posted', data));
  socket.on('disconnect', () => console.log('🔌 Disconnected:', socket.id));
});

// ── START ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vimbiso_agrilink')
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Vimbiso AgriLink API — port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV||'development'}`);
    });
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = { app, io };
