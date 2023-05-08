import { authMiddleware } from '@global/helpers/auth-middelware';
import { Create } from '@post/controllers/create-post';
import express, {Router} from 'express';



class PostRoutes {
  private router: Router;

  constructor() {
      this.router = express.Router();
  }

  public routes(): Router{
    this.router.post('/post', authMiddleware.checkAuthentification, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentification, Create.prototype.postWithImage);

    return this.router;
  }

};

export const postRoutes: PostRoutes = new PostRoutes();
