const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const { asyncWrapper } = require("../middleware/async-wrapper");

const createJob = asyncWrapper(async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(200).json({ job });
});

const getAllJobs = asyncWrapper(async (req, res) => {
  /**
   * why did we put createdBy in the Job model?
   * because in our job collections, we have all the job documents
   * no matter which user, but when user logs in, we want to show
   * him only the jobs related to him, not all the jobs (jobs of all users)
   * so, we can't just do 'find{}' we need some id to look whose jobs we
   * want, that's the reason we attach 'createdBy' to the model and the
   * req object by doing 'req.user', so now we can find using 'createdBy: req.user.userId'
   */
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");

  res.status(200).json({ count: jobs.length, name: req.user.name, jobs });
});

const getSingleJob = asyncWrapper(async (req, res) => {
  const {
    user: { userId }, // this syntax means:
    // get user and params from req, and from them, get userId from user and id as jobId from params
    // from params
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(200).json({ job });
});

const updateJob = asyncWrapper(async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (!company || !position) {
    throw new BadRequestError("Company and Position fields cannot be empty");
  }

  const updatedJob = await Job.findOneAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedJob) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(200).json({ updatedJob });
});

const deleteJob = asyncWrapper(async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(200).send();
});

module.exports = { getAllJobs, getSingleJob, deleteJob, updateJob, createJob };
