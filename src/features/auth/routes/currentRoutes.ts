import { CurrentUser } from '@auth/controllers/current-user';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { SignUp } from '@auth/controllers/signup';
import { authMiddleware } from '@global/helpers/auth-middelware';
import express, {Router} from 'express';



class CurrentRoutes {
  private router: Router;

  constructor() {
      this.router = express.Router();
  }

  public routes(): Router{
    this.router.get('/currentuser', authMiddleware.checkAuthentification, CurrentUser.prototype.read);

    return this.router;
  }

};

export const currentUserRoutes: CurrentRoutes = new CurrentRoutes();
