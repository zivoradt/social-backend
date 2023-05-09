import { updatedPost } from './../../../mocks/post.mock';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IQueryDeleted } from './../../../features/post/interfaces/post.interface';
import { IGetPostsQuery, IPostDocument, IQueryComplete } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';


class PostService{

  // Adding post to MonogoDB
  public async addPostToDB(userId: string, createdPost: IPostDocument):Promise<void>{
    //Creating post and save it
    const post: Promise<IPostDocument> = PostModel.create(createdPost);

    // Updating the user postsCount porperties
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({_id: userId}, {$inc: {postsCount: 1}});
    await Promise.all([post, user]);
  }

  // Get post method
  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]>{
    let postQuery = {};

    // Check if query have gif and img properties set
    if(query?.gifUrl && query?.imgId){
      postQuery = { $or: [{imgId: { $ne: ''}}, {gifUrl: {$ne: ''}}]};
    }
    else {
      // If query don't have propertie just passing query to postQuery
      postQuery = query;
    }

    // Getting post from DB with queries
    const posts: IPostDocument[] = await PostModel.aggregate([
      {$match: postQuery},
      {$sort: sort},
      {$skip: skip},
      {$limit: limit}
    ]);

    return posts;
  };

  // Method that return number of post documents in DB
  public async postsCount(): Promise<number>{
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }

  // Method that delete post from DB
  public async deletePost(postId: string, userId: string): Promise<void>{

    // Delete post from DB
    const deletePost = await PostModel.deleteOne({_id: postId});

    // Add implementation for reactions here

    // Decrement postCount in User collection
    const decrementPostCount: UpdateQuery<IUserDocument> = await UserModel.updateOne({_id: userId}, {$inc: {postsCount: -1}});

  }

  // Method that update post in DB
  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void>{
    // Update post
     await PostModel.updateOne({_id: postId}, {$set: updatedPost});
  }


};

export const postService: PostService = new PostService();
