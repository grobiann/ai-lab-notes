import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { CommentLike } from '../models/CommentLike';
import { Tag } from '../models/Tag';
import { RefreshToken } from '../models/RefreshToken';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'ai_lab_notes',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Post, Comment, CommentLike, Tag, RefreshToken],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  dropSchema: false,
});
