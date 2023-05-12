import { authMiddleware } from '@global/helpers/auth-middelware';
import { Add } from '@reactions/controllers/add-reactions';
import express, {Router} from 'express';



export class ReactionRouter{
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router{
    this.router.post('/post/reaction', authMiddleware.checkAuthentification, Add.prototype.reaction);

    return this.router;
  }

}

export const reactionRouter: ReactionRouter = new ReactionRouter();

