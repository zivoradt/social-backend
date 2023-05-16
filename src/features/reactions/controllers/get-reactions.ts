import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionService } from '@services/db/reaction.service';
import mongoose from 'mongoose';


const reactionCache: ReactionCache = new ReactionCache();


export class Get {

  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    // Get reaction from Redis
    const cachedReaction: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);

    // If Redis don't have an answer go to DB and retrive reaction from there
    const reactions: [IReactionDocument[], number] =
      cachedReaction[0].length ? cachedReaction : await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;

    // Get reaction from Redis
    const cachedReaction: [IReactionDocument, number] | [] = await reactionCache.getSingleReactionByUsernameFromCache(postId, username);

    // If Redis don't have an answer go to DB and retrive reaction from there
    const reactions: [IReactionDocument, number] | [] =
      cachedReaction.length ? cachedReaction : await reactionService.getSinglePostReactionByUsername(postId, username);

    res.status(HTTP_STATUS.OK).json({ message: 'Single post reaction by username', reactions: reactions.length ? reactions[0] : {}, count: reactions.length ? reactions[1] : 0 });
  }

  public async reactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;

    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);


    res.status(HTTP_STATUS.OK).json({ message: 'All reactions by username', reactions: reactions });
  }
}
