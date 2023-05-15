import { authMiddleware } from '@global/helpers/auth-middelware';
import { Add } from '@reactions/controllers/add-reactions';
import { Remove } from '@reactions/controllers/remove-reaction';
import express, {Router} from 'express';



export class ReactionRouter{
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router{
    this.router.post('/post/reaction', authMiddleware.checkAuthentification, Add.prototype.reaction);
    this.router.delete('/post/reaction/:postId/:previousReaction/:postReaction', authMiddleware.checkAuthentification, Remove.prototype.reaction);

    return this.router;
  }

}

export const reactionRouter: ReactionRouter = new ReactionRouter();

