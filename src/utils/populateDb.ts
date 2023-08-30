require('dotenv').config();
import connectDB from '../db/connect';
import Job from '../models/Job';
const mockData = require('./../../mock-data.json');

const populateDB = async () => {
  try {
    await connectDB(process.env.MONGODB_URI as string);
    await Job.insertMany(mockData);
    console.log('Mock Data Inserted');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

populateDB();
