import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { reactionService } from '@services/db/reaction.service';

const log: Logger = config.createLogger('reactionWorker');

class ReactionWorker {
  async addRectionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      // Data object is passed directy in controller
      const { data } = job;
      await reactionService.addRectionDataToDB(data);
      job.progress(100);
      done(null, data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeRectionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      // Data object is passed directy in controller
      const { data } = job;
      await reactionService.removeReactionFromDB(data);
      job.progress(100);
      done(null, data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
