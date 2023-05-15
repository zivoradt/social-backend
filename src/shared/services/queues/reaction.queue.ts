import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { reactionWorker } from '@workers/reaction.worker';


class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    // Add reaction to DB
    this.processJob('addReactionToDB', 5, reactionWorker.addRectionToDB);

    // Remove reaction from DB
    this.processJob('removeReactionFromDB', 5, reactionWorker.removeRectionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
