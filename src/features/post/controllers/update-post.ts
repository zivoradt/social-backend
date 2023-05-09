import { updatedPost } from './../../../mocks/post.mock';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { IPostDocument } from '@post/interfaces/post.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema } from '@post/schemas/post.schemes';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads } from '@global/helpers/cloudinary-upload';

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

    res.status(HTTP_STATUS.OK).json({message: 'Post updated successfully'});
  }


  // Update post with same image
  @joiValidation(postWithImageSchema)
  public async postWithImage(req:Request,res:Response): Promise<void>{

   const {imgId, imgVersion} = req.body;

   if(imgId && imgVersion){
    Update.prototype.updatePostWithImage(req);
   }
   else{
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if(!result.public_id){
        throw new BadRequestError(result.message);
      }
   }
    res.status(HTTP_STATUS.OK).json({message: 'Post with image updated successfully'});
  }

  private async updatePostWithImage(req: Request): Promise<void>{

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

  // Add new image to post
  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse>{

    // Extract value from request object
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const {postId} = req.params;

    // Upload image to cloudinary and return result (if is error - it will resolved where function is called)
    const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }

    // Create IPostDocument object to pass to redis
    const updatedPost: IPostDocument = {
      post, bgColor, feelings, privacy, gifUrl, imgId: result.public_id, imgVersion: result.version.toString(),  profilePicture
    } as IPostDocument;

    // Save to redis and take a returning object of updated post to pass as object to save to DB
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);

    // Sending updated post back to client
    socketIOPostObject.emit('updated post', postUpdated, 'post');

    // Save updated post from redis to DB
    postQueue.addPostJob('updatePostInDB', {key: postId, value: postUpdated});

    return result;
 }
}
