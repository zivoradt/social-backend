import { AuthDto } from '@auth/dto/auth.dto';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';
import { IAuthRepository } from '@repository/repository';
import { BaseCache } from '@services/redis/base.cache';
import { ObjectId } from 'mongoose';

export interface IAuthService{

   createAuthUser(data: AuthDto): Promise<void>
   getUserByUsernameOrEmail(username: string, emai: string): Promise<IAuthDocument>
   getAuthUserByUsername(username: string): Promise<IAuthDocument>
}


class AuthService implements IAuthService {
  private repository: IAuthRepository;
  private cache: BaseCache;
  constructor(repository: IAuthRepository, cache: BaseCache){
    this.repository = repository;
    this.cache = cache;
  }


  public async createAuthUser(data: AuthDto): Promise<void> {





    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username: data.username,
      email: data.email,
      password: data.password,
      avatarColor: data.avatarColor,
    });

    await this.repository.createAuthUser(data);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = await this.repository.getUserByUsernameOrEmail(username, email);
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = await this.repository.getAuthUserByUsername(username);
    return user;
  }


}


export const authService: AuthService = new AuthService();
