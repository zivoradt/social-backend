import { BaseQueue } from '@services/queues/base.queue';
import { userWorker } from '@workers/user.worker';

export class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }

  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
