/* eslint-disable @typescript-eslint/no-unused-vars */
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionModel } from '@reactions/models/reaction.schema';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';

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

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {

    // Get post from DB from query and sort it
      const reactions: IReactionDocument[] = await ReactionModel.aggregate([
        {$match: query},
        {$sort: sort}
      ]);

      return [reactions, reactions.length];
  }

  public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {

    // Get single reaction by username
   const reaction: IReactionDocument[] = await ReactionModel.aggregate([
    {$match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username)}}
   ]);

   return reaction.length ? [reaction[0], 1] : [];
  }

  // Get all reactions from username
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {

    // Get single reaction by username
   const reaction: IReactionDocument[] = await ReactionModel.aggregate([
    {$match: {username: Helpers.firstLetterUppercase(username)}}
   ]);

   return reaction;
  }
}




export const reactionService: ReactionService = new ReactionService();
