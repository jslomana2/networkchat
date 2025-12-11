import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import ticketsRouter from './routes/tickets';
import partsRouter from './routes/parts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/parts', partsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('ticket:created', (ticket) => {
    socket.broadcast.emit('ticket:created', ticket);
  });

  socket.on('ticket:updated', (ticket) => {
    socket.broadcast.emit('ticket:updated', ticket);
  });

  socket.on('ticket:deleted', (ticketId) => {
    socket.broadcast.emit('ticket:deleted', ticketId);
  });

  socket.on('part:created', (part) => {
    socket.broadcast.emit('part:created', part);
  });

  socket.on('part:updated', (part) => {
    socket.broadcast.emit('part:updated', part);
  });

  socket.on('part:deleted', (partId) => {
    socket.broadcast.emit('part:deleted', partId);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

export { io };
