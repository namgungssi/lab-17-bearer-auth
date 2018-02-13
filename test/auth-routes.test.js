'use strict';



const request = require('superagent');
const mongoose = require('mongoose');
const User = require('../models/user.js');
const expect = require('expect');
require('supertest');

process.env.DB_URL = 'mongodb://localhost:27017/costumes_stg';
const PORT = 4000;
const HOST = 'http://localhost';
const API = 'api/1.0';



beforeAll(() => {
  require('../lib/_server').start(PORT);
  return User.remove({});
});


afterAll(() => {
  mongoose.connection.close();
  require('../lib/_server').stop;
});

let validJWT = '';
let testUser = {};


describe('POST /signup', () => {
  test('a new user can sign up when valid creds are provided', () => {
    testUser = new User({username: 'Brian', password:'1234', email:'mail'});
    return request
      .post(`${HOST}:${PORT}/${API}/signup`)
      .send(testUser)
      .then(res => {
        validJWT = res.text;
        expect(res.text).not.toBe(undefined);
        expect(res.status).toEqual(200);
      });
  });

  test('400 is returned if no body is posted on signup', () => {

    return request
      .post(`${HOST}:${PORT}/${API}/signup`)
      .send({})
      .then(Promise.reject)
      .catch(res => {
        expect(res.message).toBe('Bad Request');
        expect(res.status).toEqual(400);
      });
  });

  test('400 is returned if incomplete data is posted on signup', () => {

    return request
      .post(`${HOST}:${PORT}/${API}/signup`)
      .send({username: 'Jacob'})
      .then(Promise.reject)
      .catch(res => {
        expect(res.message).toBe('Bad Request');
        expect(res.status).toEqual(400);
      });
  });
});

describe('GET /signin', () => {

  test('Sign in w/valid creds should return a 200 and an auth token', () => {

    return request
      .get(`${HOST}:${PORT}/${API}/signin`)
      .auth('Brian', '1234')
      .then(res => {
        expect(res.text).not.toBe(undefined);
        expect(res.status).toEqual(200);
      });
  });

  test('Sign in with invalid creds should return a 401 and an auth token', () => {

    return request
      .get(`${HOST}:${PORT}/${API}/signin`)
      .auth('Brian', '1123')
      .then(Promise.reject)
      .catch(res => {
        expect(res.message).toBe('Unauthorized');
        expect(res.status).toEqual(401);
      });
  });
});

describe('GET /mystuff', () => {

  test('Sign in with correct jwt should return user ID and a 200', () => {

    return request
      .get(`${HOST}:${PORT}/${API}/mystuff`)
      .set('Authorization', `Bearer ${validJWT}`)
      .then(res => {
        expect(res.text).toBe(`ID ${testUser._id}`);
        expect(res.status).toEqual(200);
      });
  });

  test('Sign in without any token should return a 401', () => {

    return request
      .get(`${HOST}:${PORT}/${API}/mystuff`)
      .set('Authorization', `Bearer`)
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toEqual(401);
      });
  });

  test('Sign in with invalid token should return a 401', () => {

    let invalidJWT = 'randomString';
    return request
      .get(`${HOST}:${PORT}/${API}/mystuff`)
      .set('Authorization', `Bearer ${invalidJWT}`)
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toEqual(401);
      });
  });
});

describe('PUT /user', () => {

  test('Updating user username and email should return next values and 200', () => {

    return request
      .put(`${HOST}:${PORT}/${API}/user`)
      .set('Authorization', `Bearer ${validJWT}`)
      .send({username: 'BrianNamgung', password: '1234', email: 'myNewMail'})
      .then(res => {
        expect(res.body).toEqual({username: 'BrianNamgung', email: 'myNewMail'});
        expect(res.status).toBe(200);
      });
  });

  test('If no token is provided, return a 401', () => {

    return request
      .put(`${HOST}:${PORT}/${API}/user`)
      .set('Authorization', `Bearer`)
      .send({username: 'BrianMam', password: '1234', email: 'nope'})
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toBe(401);
      });
  });

  test('If invalid token is provided, return a 401', () => {

    let invalidJWT = 'helloWorld';

    return request
      .put(`${HOST}:${PORT}/${API}/user`)
      .set('Authorization', `Bearer ${invalidJWT}`)
      .send({username: 'BrianMam', password: '1234', email: 'nope'})
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toBe(401);
      });
  });

  test('If no username and email is provided, return a 400', () => {

    return request
      .put(`${HOST}:${PORT}/${API}/user`)
      .set('Authorization', `Bearer ${validJWT}`)
      .send({username: 'BrianMam'})
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toBe(400);
      });
  });
});

describe('UNREGISTERED ROUTES', () => {

  test('Bad URI should return a 404', () => {

    return request
      .get(`${HOST}:${PORT}/signin`) //missing the API version
      .auth('Brian', '5555')
      .then(Promise.reject)
      .catch(res => {
        expect(res.message).toBe('not found');
        expect(res.status).toEqual(404);
      });
  });
});
