/* eslint-disable @typescript-eslint/no-unused-vars */
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionModel } from '@reactions/models/reaction.schema';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { omit } from 'lodash';

const userCache: UserCache = new UserCache();

class ReactionService {

  public async addRectionDataToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, username, previousReaction, userTo, userFrom, type, reactionObject } = reactionData;

    let updateReactionObject: IReactionDocument = reactionObject as IReactionDocument;

    if (previousReaction) {
      updateReactionObject = omit(reactionObject, ['_id']);
    }

    // This const have reavtion, user and post document as returnin type and it will be used later as notification
    const updateReaction: [IUserDocument, IReactionDocument, IPostDocument] = await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updateReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ]) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

    // Send notification to user
  }


  public async removeReactionFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;

    await Promise.all([
      // Delete reaction from DB
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),

      // Updated post in DB (decrement by one)
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }
}


export const reactionService: ReactionService = new ReactionService();
