import { authMiddleware } from '@global/helpers/auth-middelware';
import { Create } from '@post/controllers/create-post';
import { Delete } from '@post/controllers/delete-post';
import { Get } from '@post/controllers/get-post';
import { Update } from '@post/controllers/update-post';
import express, {Router} from 'express';



class PostRoutes {
  private router: Router;

  constructor() {
      this.router = express.Router();
  }

  public routes(): Router{
    this.router.get('/post/all/:page', authMiddleware.checkAuthentification, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentification, Get.prototype.postsWithImages);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentification, Delete.prototype.post);
    this.router.put('/post/:postId', authMiddleware.checkAuthentification, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentification, Update.prototype.postWithImage);
    this.router.post('/post', authMiddleware.checkAuthentification, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentification, Create.prototype.postWithImage);

    return this.router;
  }

};

export const postRoutes: PostRoutes = new PostRoutes();
