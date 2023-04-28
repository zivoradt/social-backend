import { signUpDto } from '@auth/dto/auth.dto';
import { Request, Response, NextFunction } from 'express';


export class Controller {
  private service: IService;
  constructor(service: IService) {
    this.service = service;
  }

  public async singIn(req:Request, res:Response, next:Next):Promise<void>{

    const signUpData: signUpDto = req.body;
    await this.service.signUp(signUpData);
  }

}

