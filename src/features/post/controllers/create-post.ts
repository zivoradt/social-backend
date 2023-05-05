import { joiValidation } from '@global/decorators/joi-validation.decorators';
import HTTP_STATUS  from 'http-status-codes';
import { Request, Response } from 'express';
import { postSchema } from '@post/schemas/post.schemes';
import { ObjectId } from 'mongodb';
import { IPostDocument } from '@post/interfaces/post.interface';

export class Create{

  @joiValidation(postSchema)
  public async post(req: Request, res: Response):Promise<void>{
    const { post, bgColor, privacy, giUrl, profilePicture, feelings} = req.body;

    const postObjectId: ObjectId = new ObjectId();

    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,

    }
  }
}
