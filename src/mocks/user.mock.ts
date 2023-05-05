import { IUserDocument } from '@user/interfaces/user.interface';

export const mockExistingUser = {
  notifications:{
    messages: true,
    reaction: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',

  },
  blocked: [],
  blockedby: [],
  followersCount: 1,
  followingCount: 2,
  postCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://dasdad-dasdad',
  _id: '60521d231dasdasd',
  work: 'KickChat',
  school: 'University',
  location: 'Serbia',
  quote: 'Sky is limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUser = {
  notifications:{
    messages: true,
    reaction: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',

  },
  blocked: [],
  blockedby: [],
  followersCount: 1,
  followingCount: 2,
  postCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://dasdad-dasdad',
  _id: '60521d231dasdasd',
  work: 'KickChat',
  school: 'University',
  location: 'Serbia',
  quote: 'Sky is limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const searchedUserMock = {
  profilePictureL: 'http://placehodl.tr',
  _id: '60521d231dasdasd',
  uId: '12312r412412',
  username: 'zivorad',
  email: 'zivoradtrickovic@gmail.com',
  avatarColor: '#9431'
};

export const userJwt = 'uaf0fahfuasbndyu1bri1n08fnianipsdfn1qiw3n1di0nipqwndkq';
