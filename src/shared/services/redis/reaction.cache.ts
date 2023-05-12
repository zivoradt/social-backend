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
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReaction)];
        await this.client.HSET(`posts:${key}`, dataToSave);
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

      // update post reactions
      const dataToSave: string[] = ['reactions', JSON.stringify(postReaction)];
      await this.client.HSET(`posts:${key}`, dataToSave);


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
