/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import {find} from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, IReactions } from '@post/interfaces/post.interface';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';

// Created Logger for reactions cache
const log: Logger = config.createLogger('reactionsCache');

export class ReactionCache extends BaseCache {
    constructor(){
    super('reactionCache');
  }

  public async savePostReactionToCache(key: string, reaction: IReactionDocument, postReaction: IReactions, type: string, previousReaction: string): Promise<void>{
    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }

      if(previousReaction){
        this.removePostReactionFromCache(key, reaction.username, postReaction);
      }

      if(type){
        // Push reaction to Redis field reactions
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));

        // Update the post field in Redis
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReaction));
      }

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error');
    }
  }

  // Remove reaction from list in cache (swap reaction)
  public async removePostReactionFromCache(key: string, username: string, postReaction: IReactions): Promise<void>{
    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }
      // Get all data from reaction list
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0,-1);

      // Redis method which enable to be saved mulitple commands in same time
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      // Search if previous reaction exist
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;

      // Remove that reaction from array
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));

      // Execute all commands
      await multi.exec();

      // Update post reactions
      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReaction));


    } catch (error) {
      log.error(error);
      throw new ServerError('Server error');
    }
  }

   public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }
      // Get number of reaction on one post
      const reactionCount: number = await this.client.LLEN(`reactions:${postId}`);

      // List of reaction
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const list: IReactionDocument[] = [];

      for(const item of response){
        list.push(Helpers.parseJson(item));
      }

      return list.length ? [list, reactionCount] : [[], 0];

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error');
    }
  }

  public async getSingleReactionByUsernameFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }


      // List of reaction
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      // Initiate empty list
      const list: IReactionDocument[] = [];

      // Parse to JSON
      for(const item of response){
        list.push(Helpers.parseJson(item));
      }

      const result: IReactionDocument = find(list, (listItem: IReactionDocument)=>{
        return listItem?.postId === postId && listItem?.username === username;
      }) as IReactionDocument;

      return result ? [result, 1] : [];

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error');
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined{

    const list: IReactionDocument[] = [];

    for(const item of response){
      list.push(Helpers.parseJson(item) as IReactionDocument);
    }
    return find(list, (listItem: IReactionDocument)=>{
      return listItem.username === username;
    });

  }
}
