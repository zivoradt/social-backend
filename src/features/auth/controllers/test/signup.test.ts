/* eslint-disable @typescript-eslint/no-empty-function */
import {Request, Response} from 'express';
import * as cloudinary from '@global/helpers/cloudinary-upload';
import { authMock, authMockRequest } from '@root/mocks/auth.mock';
import { authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@global/helpers/cloudinary-upload');

describe('Signup', ()=>{

  beforeEach(()=>{
    jest.resetAllMocks();
  });

  afterEach(()=>{
    jest.clearAllMocks();
  });

  it('should throw error if username is not available', ()=>{
    const req: Request = authMockRequest({}, {
      username: '',
      email: 'zivoradtrickovic@gmail.com',
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
      email: 'zivoradtrickovic@gmail.com',
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
      email: 'zivoradtrickovic@gmail.com',
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
      email: 'zivoradtrickovic@gmail.com',
      password: '',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password is less than minimum lenght', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'zivoradtrickovic@gmail.com',
      password: '12',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password is greater than maximum lenght', ()=>{
    const req: Request = authMockRequest({}, {
      username: 'zivorad',
      email: 'zivoradtrickovic@gmail.com',
      password: '1234567890',
      avatarColor: 'blue',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid password');
    });
  });

  it('should throw an errof if user already exist', ()=>{
    const req: Request = authMockRequest({},{
      username: 'zivorad',
      email: 'zivoradtrickovic@gmail.com',
      password: '1234567890',
      avatarColor: '#9c27b0',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError)=>{
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid password');
    });
  });

  it('should set session data for valid credentials and send correct json response', async ()=>{
    const req: Request = authMockRequest({},{
      username: 'zivorad',
      email: 'zivoradtrickovic@gmail.com',
      password: '123456',
      avatarColor: '#9c27b0',
      avatarImage: '/data/23dasr4qda/',
    })as Request;

    const res: Response = authMockResponse();

    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);

    jest.spyOn(cloudinary, 'uploads').mockImplementation(():any => Promise.resolve({version:'12345', public_id: '123456'}));

    await SignUp.prototype.create(req, res);
    console.log(userSpy.mock);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toBeCalledWith({
    message: 'User created successfully',
    user: userSpy.mock.calls[0][2],
    token: req.session?.jwt
    });
});

});
