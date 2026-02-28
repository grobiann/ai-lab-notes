import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';

dotenv.config();

const app = express();
const PORT = config.server.port;

app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
}));

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: ${config.server.apiUrl}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
});
