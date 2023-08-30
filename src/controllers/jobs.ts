import {Request, Response, NextFunction, query} from 'express';
import Job from '../models/Job';
import {Types} from 'mongoose';
import moment from 'moment';
import {StatusCodes} from 'http-status-codes';
import {BadRequestError, NotFoundError} from '../errors';
import {IDefaultStat} from '../interfaces';

export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // jobs?status=all&jobType=all&sort=latest&page=1
  const {status, jobType, sort, search} = req.query;

  let queryObj: any = {createdBy: req.user!.userId};
  if (status && status !== 'all') {
    queryObj.status = status;
  }
  if (status && jobType !== 'all') {
    queryObj.jobType = jobType;
  }

  if (search) {
    queryObj.position = {
      $regex: search.toString(),
      $options: 'i',
    };
  }

  let jobQuery = Job.find(queryObj);

  let sortStr;
  if (sort === 'latest') {
    sortStr = '-createdAt';
  }
  if (sort === 'oldest') {
    sortStr = 'createdAt';
  }

  if (sort === 'a-z') {
    sortStr = 'position';
  }
  if (sort === 'z-a') {
    sortStr = '-position';
  }

  jobQuery = jobQuery.sort(sortStr);

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  jobQuery = jobQuery.skip(skip).limit(limit);
  const jobs = await jobQuery;

  const totalJobs = await Job.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({jobs, totalJobs, numOfPages});
};

export const getJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jobId = req.params.id;
  const job = await Job.findOne({_id: jobId, createdBy: req.user!.userId});
  if (!job) {
    throw new NotFoundError(`No Job found with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({job});
};
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {company, position} = req.body;
  if (!company || !position) {
    throw new BadRequestError('Please provide company and position');
  }
  const newJob = {
    company,
    position,
    createdBy: req.user!.userId,
  };

  const job = await Job.create(newJob);
  res.status(StatusCodes.CREATED).json({job});
};
export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jobId = req.params.id;
  const {company, position} = req.body;
  if (company === '' || position == '') {
    throw new BadRequestError('Please provide valid company or position');
  }

  const job = await Job.findOneAndUpdate(
    {
      _id: jobId,
      createdBy: req.user!.userId,
    },
    {...req.body},
    {
      runValidators: true,
      new: true,
    }
  );

  if (!job) {
    throw new NotFoundError(`No Job found with id ${jobId}`);
  }

  res.status(StatusCodes.CREATED).json({job});
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jobId = req.params.id;
  const userId = req.user!.userId;

  const job = await Job.findByIdAndRemove({_id: jobId, createdBy: userId});
  if (!job) {
    throw new NotFoundError(`No Job found with id ${jobId}`);
  }
  res.sendStatus(StatusCodes.NO_CONTENT);
};

export const showStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stats = await Job.aggregate([
    {$match: {createdBy: Types.ObjectId(req.user!.userId)}}, // that belongs to a specific user. need mongoose id type
    {$group: {_id: '$status', count: {$sum: 1}}}, // group based on status and count total types
  ]);

  const reducedStats = stats.reduce((acc: any, curr: any) => {
    const {_id: title, count} = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats: IDefaultStat = {
    pending: reducedStats.pending || 0,
    interview: reducedStats.interview || 0,
    declined: reducedStats.declined || 0,
  };

  const monthlyApplicationsAgg = await Job.aggregate([
    {
      $match: {createdBy: Types.ObjectId(req.user!.userId)},
    },
    {
      $group: {
        _id: {
          year: {$year: '$createdAt'},
          month: {$month: '$createdAt'},
        },
        count: {$sum: 1},
      },
    },
    {
      $sort: {
        '_id.year': -1,
        '_id.month': -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  const monthlyApplications = monthlyApplicationsAgg
    .map((item: any) => {
      const {
        _id: {year, month},
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return {date, count};
    })
    .reverse();

  console.log(monthlyApplications);

  console.log(reducedStats);
  res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  });
};
