import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const {username, ipaddress, email, date} = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'),{
    username,
    email,
    ipaddress,
    date,
    image_url: 'https://png.pngtree.com/png-vector/20190120/ourmid/pngtree-lock-vector-icon-png-image_470286.jpg'
  });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
