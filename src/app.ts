// import required packages
import express from 'express';
require('dotenv').config();
require('express-async-errors');
import jobsRouter from './routes/jobs';
import authRouter from './routes/auth';
import connectDB from './db/connect';
import helmet from 'helmet';
const xss = require('xss-clean');
const path = require('path');

// error handler
import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';

// auth middleware
import {authenticateUser} from './middleware/authentication';

const app = express();

// api limiter
app.set('trust proxy', 1);

// serving frontend
app.use(express.static(path.resolve(__dirname, '../client/build')));

// parser
app.use(express.json());

// express security
app.use(helmet());
app.use(xss());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI as string);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
