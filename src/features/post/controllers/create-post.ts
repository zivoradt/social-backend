import { CurrentUser } from './../../auth/controllers/current-user';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { postSchema, postWithImageSchema } from '@post/schemas/post.schemes';
import { ObjectId } from 'mongodb';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads } from '@global/helpers/cloudinary-upload';

const postCache: PostCache = new PostCache();

export class Create {


  @joiValidation(postSchema)
  //Created post without image
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;

    // Created post ID
    const postObjectId: ObjectId = new ObjectId();

    // Create post
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      commentsCount: 0,
      gifUrl,
      privacy,
      feelings,
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 },
      createdAt: new Date(),
      imgVersion: '',
      imgId: ''
    } as IPostDocument;

    // Send created post to user without waiting to save to redis or DB
    socketIOPostObject.emit('add post', createdPost);

    // Save post to cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    // Adding userId and created posto to Queue middleware to send back to MonogDb
    postQueue.addPostJob('addPostToDB', ({key: req.currentUser!.userId, value: createdPost }));


    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  //Created post with image
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    // Created post ID
    const postObjectId: ObjectId = new ObjectId();

    // Create post
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      commentsCount: 0,
      gifUrl,
      privacy,
      feelings,
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 },
      createdAt: new Date(),
      imgVersion: result?.version.toString(),
      imgId: result?.public_id
    } as IPostDocument;

    // Send created post to user without waiting to save to redis or DB
    socketIOPostObject.emit('add post', createdPost);

    // Save post to cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    // Adding userId and created posto to Queue middleware to send back to MonogDb
    postQueue.addPostJob('addPostToDB', ({key: req.currentUser!.userId, value: createdPost }));

    //create a method to add image to mongodb dataabse

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });
  }

}
