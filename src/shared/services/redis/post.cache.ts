/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, IReactions, ISavePostToCache } from '@post/interfaces/post.interface';

import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';

// Created Logger for post cache
const log: Logger = config.createLogger('postCache');

// Created type for retriving data (posts array of elements)
export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];


// Extended base clase for post class to save post to cache
export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  // Saving post to cache
  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt
    } = createdPost;

    const dataToSave = {
      '_id': `${_id}`,
      'userId':
        `${userId}`,
      'username':
        `${username}`,
      'email':
        `${email}`,
      'avatarColor':
        `${avatarColor}`,
      'profilePicture':
        `${profilePicture}`,
      'post':
        `${post}`,
      'bgColor':
        `${bgColor}`,
      'feelings':
        `${feelings}`,
      'privacy':
        `${privacy}`,
      'gifUrl':
        `${gifUrl}`,
      'commentsCount':
        `${commentsCount}`,
      'reactions':
        JSON.stringify(reactions),
      'imgVersion':
        `${imgVersion}`,
      'imgId':
        `${imgId}`,
      'createdAt':
        `${createdAt}`
    };

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      // Take postcount property from user to be incremented
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');

      // Redis method which enable to be saved mulitple commands in same time
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Created sorted set in Reddis
      multi.ZADD('posts', { score: parseInt(uId, 10), value: `${key}` });
      // Seting post with key value to find and array with post properties

      // Loop through dataToSave object and set properties in Reddis
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        // Save data to Reddis
        multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }

      // Increment post count by one
      const count: number = parseInt(postCount[0], 10) + 1;

      // Update post count number in user cache
      multi.HSET(`users:${currentUserId}`, 'postsCount', count);

      // Executed all command to Reddis
      multi.exec();

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Method which will return a post from cache in seted range
  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // Taking range of ordered reverse list of posts ID
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      // Redis method which enable to be saved mulitple commands in same time
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Going through range of values and returning post to client
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      // Everything is stored in replies
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;

      // Create empty array for post
      const postReplies: IPostDocument[] = [];

      //Loop through post and cast properties to JSON
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));

        // Push post to array of posts
        postReplies.push(post);

      }
      // Return post
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Method which will return number of post
  public async getTotalPostsInCache(): Promise<number> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      // Get total number of post in cache
      const count: number = await this.client.ZCARD('posts');

      // Return number of posts
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  };

  // Method which will return a post with images from cache in seted range
  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // Taking range of ordered reverse list of posts ID
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      // Redis method which enable to be saved mulitple commands in same time
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Going through range of values and returning post to client
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      // Everything is stored in replies
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;

      // Create empty array for post
      const postWithImages: IPostDocument[] = [];

      //Loop through post and cast properties to JSON
      for (const post of replies as IPostDocument[]) {
        if (post.imgId && post.imgVersion || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
          post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));

          // Push post with image to array of posts
          postWithImages.push(post);
        }

      }
      // Return post with images
      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Method which will return a user posts from cache
  public async getUserPostFromCache(key: string, uId: number): Promise<IPostDocument[]> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // Taking range of ordered reverse list of posts ID
      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });

      // Redis method which enable to be saved mulitple commands in same time
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Going through range of values and returning post to client
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      // Everything is stored in replies
      const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;

      // Create empty array for post
      const postReplies: IPostDocument[] = [];

      //Loop through post and cast properties to JSON
      for (const post of replies as IPostDocument[]) {

        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));

        // Push user post with to array of posts
        postReplies.push(post);


      }
      // Return post with images
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Method which will return number of post from specific user
  public async getTotalUserPostsInCache(uId: number): Promise<number> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      // Get total number of post in cache
      const count: number = await this.client.ZCOUNT('posts', uId, uId);

      // Return number of users posts
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Method which will remove post from cache
  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Delete post from sorted set
      multi.ZREM('posts', `${key}`);

      // Delete post, comment and reaction from Redis
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);

      // Decrement post count by one
      const count: number = parseInt(postCount[0], 10) - 1;

      // Update post count number in user cache
      multi.HSET(`users:${currentUserId}`, 'postsCount', count);

      // Execute all command from above
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // Update post
  public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {

    // Extract properties which need to updated
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = updatedPost;

    const dataToSave = {
      'post':
        `${post}`,
      'bgColor':
        `${bgColor}`,
      'feelings':
        `${feelings}`,
      'privacy':
        `${privacy}`,
      'gifUrl':
        `${gifUrl}`,
      'imgVersion':
        `${imgVersion}`,
      'imgId':
        `${imgId}`,
      'profilePicture': `${profilePicture}`,
    };

    try {
      // Check is client connection is opened
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        // Save data to Reddis
        await this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }

      // Get all properties from postId key
      multi.HGETALL(`posts:${key}`);

      // Get response in reply
      const reply: PostCacheMultiType = await multi.exec() as PostCacheMultiType;

      // Forward to postReply and cast it as IPostObject
      const postReply = reply as IPostDocument[];

      postReply[0].commentsCount = Helpers.parseJson(`${postReply[0].commentsCount}`) as number;
      postReply[0].reactions = Helpers.parseJson(`${postReply[0].reactions}`) as IReactions;
      postReply[0].createdAt = new Date(Helpers.parseJson(`${postReply[0].createdAt}`)) as Date;

      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
};
