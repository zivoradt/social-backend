import { AuthDto } from '@auth/dto/auth.dto';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';
import { IAuthRepository } from '@repository/repository';




export class AuthRepository implements IAuthRepository{

   async createAuthUser(data: AuthDto):Promise<void>{
    await AuthModel.create(data);
  }
   async getUserByUsernameOrEmail(username: string, email:string):Promise<IAuthDocument>{
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.toLowerCase(email) }]
    };
    return await AuthModel.findOne(query).exec() as IAuthDocument;
  }

   async getAuthUserByUsername(username: string): Promise<IAuthDocument>{
    return await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec() as IAuthDocument;
  }


}
