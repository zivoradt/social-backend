import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import {  PostCache } from '@services/redis/post.cache';
import { postService } from '@services/db/post.service';

const postCache: PostCache = new PostCache();

// Show how many models are gona show per page
const PAGE_SIZE = 10;

export class Get{
  public async posts(req: Request, res: Response): Promise<void> {
    const {page} = req.params;

    // Number of element which will be returned when data is requested
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;

    // Limit of elements that will be show up to client
    const limit: number = PAGE_SIZE * (parseInt(page));

    // Skip element when returning from cache
    const newSkip:number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];

    let totalPosts = 0;

    // Get post from cache with start and end
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('posts', newSkip, limit);

    if(cachedPosts.length){
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
    }
    // If data is empty from cache it return it from DB
    else{
      posts = await postService.getPosts({}, skip, limit, {createdAt: -1});
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({message: 'All posts', posts: posts, totalPosts: totalPosts});
  }

  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const {page} = req.params;

    // Number of element which will be returned when data is requested
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;

    // Limit of elements that will be show up to client
    const limit: number = PAGE_SIZE * (parseInt(page));

    // Skip element when returning from cache
    const newSkip:number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];

    // Get post from cache with start and end
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('posts', newSkip, limit);

    posts = cachedPosts.length ? cachedPosts: await postService.getPosts({imgId: '$ne', gifUrl: '$ne'}, skip, limit, {createdAt: -1});

    res.status(HTTP_STATUS.OK).json({message: 'All posts with images', posts: posts});
  }
}
