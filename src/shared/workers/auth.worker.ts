import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { AuthRepository } from '@repository/authRepository';
import { IAuthRepository } from '@repository/repository';

const log: Logger = config.createLogger('auth-worker');

class AuthWorker {
  private repository: IAuthRepository;
  constructor(repository: IAuthRepository){
    this.repository = repository;
  }
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await this.repository.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
const repository = new AuthRepository();
export const authWorker: AuthWorker = new AuthWorker(repository);
