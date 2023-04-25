import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';


class AuthService{
  public async getUserByUsernameOrEmail(username: string, email:string): Promise<IAuthDocument>{
    const query = {
      $or: [{username: Helpers.firstLetterUppercase(username)}, {email: Helpers.toLowerCase(email)}]
    };
    const user: IAuthDocument | null = await AuthModel.findOne(query).exec() as IAuthDocument;
    return user;
  };
};

export const authService: AuthService = new AuthService();
