import { updatedPost } from './../../../mocks/post.mock';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { IPostDocument } from '@post/interfaces/post.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { postSchema } from '@post/schemas/post.schemes';

const postCache: PostCache = new PostCache();

export class Update{
  @joiValidation(postSchema)
  public async post(req:Request,res:Response): Promise<void>{

    // Extract value from request object
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    const {postId} = req.params;

    // Create IPostDocument object to pass to redis
    const updatedPost: IPostDocument = {
      post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture
    } as IPostDocument;

    // Save to redis and take a returning object of updated post to pass as object to save to DB
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);

    // Sending updated post back to client
    socketIOPostObject.emit('updated post', postUpdated, 'post');

    // Save updated post from redis to DB
    postQueue.addPostJob('updatePostInDB', {key: postId, value: postUpdated});
  }
}
