import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addReactionSchema } from '@reactions/schemas/reactions';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reaction.cache';

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

    res.status(HTTP_STATUS.OK).json({message: 'Reaction added successfully'});
  }
}
