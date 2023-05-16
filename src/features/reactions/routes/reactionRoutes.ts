import { authMiddleware } from '@global/helpers/auth-middelware';
import { Add } from '@reactions/controllers/add-reactions';
import { Get } from '@reactions/controllers/get-reactions';
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

    this.router.get('/post/reaction/:postId', authMiddleware.checkAuthentification, Get.prototype.reactions);
    this.router.get('/post/single/reaction/username/:username/:postId', authMiddleware.checkAuthentification, Get.prototype.singleReactionByUsername);
    this.router.get('/post/reactions/:username', authMiddleware.checkAuthentification, Get.prototype.reactionsByUsername);

    return this.router;
  }

}

export const reactionRouter: ReactionRouter = new ReactionRouter();

