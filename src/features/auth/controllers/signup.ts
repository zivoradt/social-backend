import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemas/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { uploads } from '@global/helpers/cloudinary-upload';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@services/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';


// Cache instance
const userCache: UserCache = new UserCache();

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
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurd. Try again!');
    }

    // Add to redis cache
    const userDataToCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataToCache.profilePicture = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataToCache);

    //Add to database
    omit(userDataToCache, ['uId','username', 'avatarColor', 'email', 'password']);
    authQueue.addAuthUserJob('addAuthUserJobToDB', {value: userDataToCache});
    userQueue.addUserJob('addUserToDB', {value: userDataToCache});

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = {jwt: userJwt};

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataToCache, token: userJwt });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string{
    return JWT.sign({
      userId: userObjectId,
      uId: data.uId,
      email: data.email,
      username: data.username,
      avatarColor: data.avatarColor
    },
    config.JWT_TOKEN!
    );
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

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }

    } as unknown as IUserDocument;
  }
}
