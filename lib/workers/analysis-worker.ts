import { Job } from 'bull';
import analysisQueue, { AnalysisJobData, AnalysisJobResult } from '../queue';
import { analyzeVacancy } from '../gemini';
import { dbClient } from '../db';
import { nanoid } from 'nanoid';

/**
 * Worker process for analyzing vacancies in the background
 * This allows users to close their browser while analysis continues
 */

// Register the processor
analysisQueue.process(async (job: Job<AnalysisJobData>) => {
  const { jobId, vacancyText, category, locale, email } = job.data;

  console.log(`[Worker] Processing analysis job ${jobId}`);

  try {
    // Update job status in database
    await updateJobStatus(jobId, 'processing');

    // Perform the analysis
    const analysis = await analyzeVacancy(vacancyText, category, locale);

    // Save to database
    const reportId = nanoid(10);
    await dbClient.createReport(reportId, vacancyText, JSON.stringify(analysis));

    // Update job status
    await updateJobStatus(jobId, 'completed', reportId);

    console.log(`[Worker] Completed analysis job ${jobId} -> report ${reportId}`);

    // If email was provided, send notification
    if (email) {
      await sendAnalysisCompleteEmail(email, reportId, locale);
    }

    return {
      reportId,
      success: true,
    } as AnalysisJobResult;
  } catch (error: any) {
    console.error(`[Worker] Failed analysis job ${jobId}:`, error);

    // Update job status
    await updateJobStatus(jobId, 'failed', undefined, error.message);

    // If email was provided, send failure notification
    if (email) {
      await sendAnalysisFailedEmail(email, locale);
    }

    throw error; // Re-throw for Bull to handle retries
  }
});

// Helper: Update job status in database
async function updateJobStatus(
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  reportId?: string,
  errorMessage?: string
) {
  const db = await import('../db-raw'); // Use raw SQL for job updates
  const completedAt = status === 'completed' || status === 'failed' ? Date.now() / 1000 : null;

  db.dbRaw.prepare(
    `UPDATE analysis_jobs
     SET status = ?,
         result_json = ?,
         error_message = ?,
         completed_at = ?
     WHERE id = ?`
  ).run(status, reportId ? JSON.stringify({ reportId }) : null, errorMessage ?? null, completedAt ?? null, jobId);
}

// Helper: Send email when analysis completes
async function sendAnalysisCompleteEmail(email: string, reportId: string, locale: string) {
  try {
    const { sendEmail } = await import('../email');
    const reportUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${locale}/report/${reportId}`;

    const subject = locale === 'en'
      ? 'Your vacancy analysis is ready!'
      : 'Je vacature-analyse is klaar!';

    const body = locale === 'en'
      ? `Your vacancy analysis has been completed!\n\nView your results here:\n${reportUrl}\n\nBest regards,\nVacature Tovenaar Team`
      : `Je vacature-analyse is voltooid!\n\nBekijk je resultaten hier:\n${reportUrl}\n\nMet vriendelijke groet,\nVacature Tovenaar Team`;

    await sendEmail({
      to: email,
      subject,
      body,
    });

    console.log(`[Worker] Sent completion email to ${email}`);
  } catch (error) {
    console.error(`[Worker] Failed to send completion email:`, error);
  }
}

// Helper: Send email when analysis fails
async function sendAnalysisFailedEmail(email: string, locale: string) {
  try {
    const { sendEmail } = await import('../email');

    const subject = locale === 'en'
      ? 'Vacancy analysis failed'
      : 'Vacature-analyse mislukt';

    const body = locale === 'en'
      ? `Unfortunately, we couldn't complete your vacancy analysis.\n\nPlease try again or contact support at joost@vacaturetovenaar.nl\n\nBest regards,\nVacature Tovenaar Team`
      : `Helaas konden we je vacature-analyse niet voltooien.\n\nProbeer het opnieuw of neem contact op met support via joost@vacaturetovenaar.nl\n\nMet vriendelijke groet,\nVacature Tovenaar Team`;

    await sendEmail({
      to: email,
      subject,
      body,
    });

    console.log(`[Worker] Sent failure email to ${email}`);
  } catch (error) {
    console.error(`[Worker] Failed to send failure email:`, error);
  }
}

// Event listeners for monitoring
analysisQueue.on('completed', (job, result) => {
  console.log(`[Queue] Job ${job.id} completed with result:`, result);
});

analysisQueue.on('failed', (job, err) => {
  console.error(`[Queue] Job ${job?.id} failed with error:`, err.message);
});

analysisQueue.on('stalled', (job) => {
  console.warn(`[Queue] Job ${job.id} stalled (may need restart)`);
});

console.log('[Worker] Analysis worker started and listening for jobs...');

export default analysisQueue;
