import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queues/reaction.queue';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {

  public async reaction(req:Request, res:Response): Promise<void>{
    const { postId, previousReaction, postReaction} =  req.params;

    // Remove reaction from cache
    //await reactionCache.removePostReactionFromCache(postId, req.currentUser!.username, JSON.parse(postReaction));

    // Create databaseReactionData to remove from DB
    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction
    };

    // Remove from DB
    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);

    res.status(HTTP_STATUS.OK).json({message: 'Reaction removed from post'});
  }

}
