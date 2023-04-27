import  HTTP_STATUS  from 'http-status-codes';
import { userService } from '@services/db/user.service';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Response, Request } from 'express';

const userCache: UserCache = new UserCache();

export class CurrentUser {
  public async read(req:Request, res:Response):Promise<void>{
    let isUser = false;
    let tokken = null;
    let user = null;

    const cacheUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`)as IUserDocument;
    console.log(cacheUser);
    const existingUser: IUserDocument = cacheUser ? cacheUser: await userService.getUserById(`${req.currentUser!.userId}`);
    if (Object.keys(existingUser).length) {
      isUser = true;
      tokken = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({tokken, isUser, user});
  }
}
