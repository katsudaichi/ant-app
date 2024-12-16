import express, { Request, Response, Router, RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/config';
import path from 'path';
import { QueryResult } from 'pg';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface Project {
  id: string;
  name: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

interface LoginRequest {
  email: string;
}

interface CreateProjectRequest {
  name: string;
  ownerId: string;
}

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// 静的ファイルの提供
const clientPath = path.resolve(__dirname, '../dist/client');
app.use(express.static(clientPath));

// APIルーターの作成
const apiRouter = Router();

// ユーザー登録エンドポイント
const registerHandler: RequestHandler<{}, any, RegisterRequest> = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    // メールアドレスの重複チェック
    const existingUser: QueryResult<User> = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 新規ユーザーの作成
    const result: QueryResult<User> = await pool.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, email, name, created_at',
      [email, name]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ログインエンドポイント
const loginHandler: RequestHandler<{}, any, LoginRequest> = async (req, res) => {
  const { email } = req.body;
  try {
    const result: QueryResult<User> = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// プロジェクトエンドポイント
const getProjectHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const result: QueryResult<Project> = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createProjectHandler: RequestHandler<{}, any, CreateProjectRequest> = async (req, res) => {
  const { name, ownerId } = req.body;
  try {
    const result: QueryResult<Project> = await pool.query(
      'INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, ownerId]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ルートハンドラーの登録
apiRouter.post('/auth/register', registerHandler);
apiRouter.post('/auth/login', loginHandler);
apiRouter.get('/projects/:id', getProjectHandler);
apiRouter.post('/projects', createProjectHandler);

// APIルーターをマウント
app.use('/api', apiRouter);

// WebSocket接続の処理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-project', (projectId: string) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('cursor-move', (data: { projectId: string; position: { x: number; y: number } }) => {
    socket.to(data.projectId).emit('cursor-update', {
      userId: socket.id,
      position: data.position
    });
  });

  socket.on('actor-update', async (data: { projectId: string; actorId: string; position: { x: number; y: number } }) => {
    try {
      await pool.query(
        'UPDATE actors SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [data.position.x, data.position.y, data.actorId]
      );
      socket.to(data.projectId).emit('actor-updated', {
        actorId: data.actorId,
        position: data.position
      });
    } catch (error) {
      console.error('Error updating actor:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// すべてのその他のリクエストをindex.htmlにリダイレクト
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(clientPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 