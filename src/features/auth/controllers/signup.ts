import  HTTP_STATUS  from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { ObjectSchema } from 'joi';
import { signupSchema } from '@auth/schemas/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { uploads } from '@global/helpers/cloudinary-upload';

export class SignUp {

  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if(!result?.public_id){
      throw new BadRequestError('File upload: Error occurd. Try again!');
    }

    res.status(HTTP_STATUS.CREATED).json({message: 'User created successfully', authData});
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, password, uId, avatarColor } = data;

    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.toLowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
