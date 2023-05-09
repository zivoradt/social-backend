/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { ObjectId } from 'mongoose';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, IReactions, ISavePostToCache } from '@post/interfaces/post.interface';
import { number } from 'joi';
import { RedisCommand, RedisCommandRawReply, RedisCommandReply } from '@redis/client/dist/lib/commands';

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


    // Converting properties to string to be able to be saved to cache
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`
    ];

    // Converting properties to string and from object to string to be able to be saved to cache
    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];

    // Adding both list to one array
    const dataToSave: string[] = [...firstList, ...secondList];

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
      multi.HSET(`posts:${key}`, dataToSave);

      const count: number = parseInt(postCount[0], 10) + 1;
      console.log(count);

      // Update post count number in user cache
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);

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
};
