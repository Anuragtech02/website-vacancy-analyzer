import Queue from 'bull';
import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for Bull
  enableReadyCheck: false,
};

// Create Redis clients for Bull (Bull needs separate clients for different purposes)
const createRedisClient = () => new Redis(redisConfig);

// Analysis job queue
export const analysisQueue = new Queue('vacancy-analysis', {
  createClient: (type) => {
    switch (type) {
      case 'client':
        return createRedisClient();
      case 'subscriber':
        return createRedisClient();
      case 'bclient':
        return createRedisClient();
      default:
        return createRedisClient();
    }
  },
  defaultJobOptions: {
    attempts: 2, // Retry once on failure
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200, // Keep last 200 failed jobs
  },
});

// Job data interface
export interface AnalysisJobData {
  jobId: string;
  vacancyText: string;
  category: string;
  locale: string;
  email?: string; // Optional: if user wants result via email
}

// Job result interface
export interface AnalysisJobResult {
  reportId: string;
  success: boolean;
  error?: string;
}

/**
 * Add an analysis job to the queue
 * @param data - Job data
 * @returns Job ID
 */
export async function enqueueAnalysis(data: AnalysisJobData): Promise<string> {
  const job = await analysisQueue.add(data, {
    jobId: data.jobId, // Use our custom job ID
  });

  return job.id as string;
}

/**
 * Get job status
 * @param jobId - Job ID
 * @returns Job state and progress
 */
export async function getJobStatus(jobId: string) {
  const job = await analysisQueue.getJob(jobId);

  if (!job) {
    return {exists: false, state: 'unknown', progress: 0 };
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    exists: true,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}

/**
 * Gracefully close queue connections
 */
export async function closeQueue() {
  await analysisQueue.close();
}

// Export queue for worker registration
export default analysisQueue;
