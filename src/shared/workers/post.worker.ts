import {DoneCallback, Job} from 'bull';
import Logger from 'bunyan';
import {config} from '@root/config';
import { authService } from '@services/db/auth.service';
import { postService } from '@services/db/post.service';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async savePostToDB(job:Job, done: DoneCallback):Promise<void>{
    try {
      // Extract key and value from data
      const { key, value} = job.data;

      // Forward data to post service to save it to DB
      await postService.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletePostFromDB(job:Job, done: DoneCallback):Promise<void>{
    try {
      // Extract keyOne and two from data
      const { keyOne, keyTwo} = job.data;
      // Forward data to post service to save it to DB
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updatePostInDB(job:Job, done: DoneCallback):Promise<void>{
    try {
      // Extract key and value from data
      const { key, value} = job.data;

      // Forward data to post service to save it to DB
      await postService.editPost(key, value);
      job.progress(100);
      done(null, job.data);

    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

}

export const postWorker: PostWorker = new PostWorker();
