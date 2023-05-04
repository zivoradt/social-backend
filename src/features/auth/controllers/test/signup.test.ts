/* eslint-disable @typescript-eslint/no-empty-function */
import {Request, Response} from 'express';
import * as cloudinary from '@global/helpers/cloudinary-upload';
import { authMockRequest } from '@root/mocks/auth.mock';
import { authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@global/helpers/cloudinary-upload');

describe('Signup', ()=>{

  it('should throw error if username is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: '',
      email: 'zivorad@gmail.com',
      password: '123456',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username have less then 4 letters', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'ma',
      email: 'zivorad@gmail.com',
      password: '123456',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid username');
    });
  });


  it('should throw an error if username more than maxim lenght', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'mathematics',
      email: 'zivorad@gmail.com',
      password: '123456',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is invalid', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'not valid',
      password: '123456',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: '',
      password: '123456',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'zivoradtrickovic',
      password: '',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is less than minimum lenght', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'zivoradtrickovic',
      password: '12',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is greater than maximum lenght', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'zivoradtrickovic',
      password: '1234567890',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });

});
