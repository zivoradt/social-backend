import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';


class AuthService{

  public async createAuthUser(data: IAuthDocument):Promise<void>{
    console.log(data);
    await AuthModel.create(data);
  }

  public async getUserByUsernameOrEmail(username: string, email:string): Promise<IAuthDocument>{
    const query = {
      $or: [{username: Helpers.firstLetterUppercase(username)}, {email: Helpers.toLowerCase(email)}]
    };
    const user: IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument;
    return user;
  };
};

export const authService: AuthService = new AuthService();
