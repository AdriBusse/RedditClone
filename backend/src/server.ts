import 'reflect-metadata';
import { ConnectionOptions, createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-Parser';
dotenv.config({ path: __dirname + '/../.env' });
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import subRoutes from './routes/subs';
import miscRoutes from './routes/misc';
import userRoutes from './routes/user';
import cors from 'cors';
//import ormConfig from './ormconfig';
import ormConfig from './ormconfig.json';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
console.log(process.env.ORIGIN);

app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('hello World');
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/users', userRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`server run on port ${process.env.PORT}`);
  try {
    await createConnection(ormConfig as ConnectionOptions);
    //await createConnection();

    console.log(`Connect to Db`);
  } catch (err) {
    console.log(err);
  }
});