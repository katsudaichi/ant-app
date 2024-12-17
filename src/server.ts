import express, { Request, Response, Router, RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/config';
import path from 'path';
import { QueryResult } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from './middleware/auth';

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

interface Actor {
  id: string;
  project_id: string;
  name: string;
  position_x: number;
  position_y: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
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
const registerHandler: RequestHandler<{}, any, RegisterRequest> = async (req, res): Promise<void> => {
  const { email, name, password } = req.body;
  try {
    // メールアドレスの重複チェック
    const existingUser: QueryResult<User> = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザーの作成
    const result: QueryResult<User> = await pool.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, name, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ログインエンドポイント
const loginHandler: RequestHandler<{}, any, LoginRequest> = async (req, res): Promise<void> => {
  const { email, password } = req.body;
  try {
    const result: QueryResult<User> = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
    delete user.password;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// プロジェクトエンドポイント（認証必須）
const getProjectHandler: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  try {
    const result: QueryResult<Project> = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProjectHandler: RequestHandler<{}, any, CreateProjectRequest> = async (req, res): Promise<void> => {
  const { name, ownerId } = req.body;
  try {
    const result: QueryResult<Project> = await pool.query(
      'INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, ownerId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// アクター関連のエンドポイント
const getProjectActorsHandler: RequestHandler<{ projectId: string }> = async (req, res): Promise<void> => {
  try {
    const result: QueryResult<Actor> = await pool.query(
      'SELECT * FROM actors WHERE project_id = $1 ORDER BY created_at',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateActorHandler: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  const { name, position_x, position_y } = req.body;
  try {
    const result: QueryResult<Actor> = await pool.query(
      'UPDATE actors SET name = $1, position_x = $2, position_y = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, position_x, position_y, req.params.id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Actor not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating actor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createActorHandler: RequestHandler<{ projectId: string }> = async (req, res): Promise<void> => {
  const { name, position_x, position_y, created_by } = req.body;
  try {
    const result: QueryResult<Actor> = await pool.query(
      'INSERT INTO actors (project_id, name, position_x, position_y, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.projectId, name, position_x, position_y, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating actor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// アクター関連のルートを追加
apiRouter.get('/projects/:projectId/actors', getProjectActorsHandler);
apiRouter.put('/actors/:id', updateActorHandler);
apiRouter.post('/projects/:projectId/actors', createActorHandler);

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
      // アクターの更新をデータベースに保存
      const result: QueryResult<Actor> = await pool.query(
        'UPDATE actors SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND project_id = $4 RETURNING *',
        [data.position.x, data.position.y, data.actorId, data.projectId]
      );

      if (result.rows.length === 0) {
        console.error('Actor not found or not in the specified project');
        return;
      }

      const updatedActor = result.rows[0];

      // 他のクライアントに更新を通知
      socket.to(data.projectId).emit('actor-updated', {
        actorId: data.actorId,
        position: {
          x: updatedActor.position_x,
          y: updatedActor.position_y
        }
      });
    } catch (error) {
      console.error('Error updating actor:', error);
    }
  });

  socket.on('actor-create', async (data: { projectId: string; name: string; position: { x: number; y: number }; createdBy: string }) => {
    try {
      // 新しいアクターをデータベースに作成
      const result: QueryResult<Actor> = await pool.query(
        'INSERT INTO actors (project_id, name, position_x, position_y, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [data.projectId, data.name, data.position.x, data.position.y, data.createdBy]
      );

      const newActor = result.rows[0];

      // 全クライアントに新しいアクターを通知
      io.to(data.projectId).emit('actor-created', newActor);
    } catch (error) {
      console.error('Error creating actor:', error);
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