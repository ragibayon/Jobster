import {model, Schema, Types} from 'mongoose';
import {IJob} from '../interfaces/IJob';

const jobSchema = new Schema<IJob>(
  {
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['interview', 'declined', 'pending'],
      default: 'pending',
    },
    jobLocation: {
      type: String,
      required: [true, 'Please provide position'],
      default: 'my city',
      maxlength: 100,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'internship'],
      default: 'full-time',
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'please provide an user'],
    },
  },
  {timestamps: true}
);

const Job = model('Job', jobSchema);
export default Job;
