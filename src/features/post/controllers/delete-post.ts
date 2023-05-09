import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';


const postCache: PostCache = new PostCache();


// Controller for post delete
export class Delete{

  public async post(req:Request, res: Response): Promise<void> {

    // Socket that sent to client to remove post from the list
    socketIOPostObject.emit('delete post', req.params.postId);

    // Delete post from cache
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);

    // Sent Queue to DB to delete post
    postQueue.addPostJob('deletePostFromDB', {keyOne: req.params.postId, keyTwo: req.currentUser!.userId });

    res.status(HTTP_STATUS.OK).json({message: 'Post deleted successfully'});
  }
}
