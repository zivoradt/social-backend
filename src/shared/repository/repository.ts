import { AuthDto } from '@auth/dto/auth.dto';
import { IAuthDocument } from '@auth/interfaces/auth.interface';




export interface IAuthRepository{

  createAuthUser(data: AuthDto): Promise<void>
  getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument>
  getAuthUserByUsername(username: string): Promise<IAuthDocument>
}
