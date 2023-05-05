import { Request, Response} from 'express';
import { config } from '@root/config';
import moment from 'moment';
import publicIP from 'Ip';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@services/email/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@services/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@services/email/templates/reset-password/reset-password-template';


export class Password {

  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void>{
    const { email} = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if(!existingUser){
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const radnomCharacters: string = randomBytes.toString('hex');

    await authService.updatePasswordToken(`${existingUser._id!}`, radnomCharacters, Date.now() * 60 * 60 * 10000 );


    const resetLink = `${config.CLIENT_URL}/reset-password?token=${radnomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: email, subject: 'Reset youre password'});

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.'});
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void>{
    const { password} = req.body;
    const { token } = req.params;

    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);

    if(!existingUser){
      throw new BadRequestError('Reset token has expired.');
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: existingUser.email, subject: 'Password reset confirmation.'});

    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.'});
  }
};
