import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addReactionSchema } from '@reactions/schemas/reactions';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class Add {
  @joiValidation(addReactionSchema)
  public async reaction(req:Request, res:Response): Promise<void>{
    const { userTo, postId, type, previousReaction, postReactions, profilePicture  } =  req.body;

    // Create reactionObject to save in cache Redis
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      userTo,
      profilePicture,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      type
    } as IReactionDocument;

    // Add reaction to cache
    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };

    reactionQueue.addReactionJob('addReactionToDB', databaseReactionData);

    res.status(HTTP_STATUS.OK).json({message: 'Reaction added successfully'});
  }

}
