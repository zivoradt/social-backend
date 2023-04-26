import {DoneCallback, Job} from 'bull';
import Logger from 'bunyan';
import {config} from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { authService } from '@services/db/auth.service';
import { userService } from '@services/db/user.service';

const log: Logger = config.createLogger('auth-worker');

class UserWorker {
  async addUserToDB(job:Job, done: DoneCallback):Promise<void>{
    try {
      const { value} = job.data;
      await userService.addUserData(value);
      job.progress(100);
      done(null, job.data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
