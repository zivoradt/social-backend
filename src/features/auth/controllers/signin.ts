import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { loginSchema } from '@auth/schemas/signin';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import {Response, Request} from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';
import { mailTransport } from '@services/email/mail.transport';
import { forgotPasswordTemplate } from '@services/email/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@services/queues/email.queue';
import moment from 'moment';
import publicIp from 'ip';
import { resetPasswordTemplate } from '@services/email/templates/reset-password/reset-password-template';



export class SignIn{
  @joiValidation(loginSchema)
  public async read(req: Request, res:Response):Promise<void>{
    const {username, password} = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if(!passwordMatch){
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIp.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const resetLink = `${config.CLIENT_URL}/reset-password?token=123456`;
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: 'jorge.gorczany38@ethereal.email', subject: 'Password reset conformition'});

    req.session = {jwt:userJwt};

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'Login successfully', user: userDocument, token: userJwt });
  }
}
