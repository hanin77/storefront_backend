import supertest from 'supertest'
import app from '../../server'
import Client from '../../database'
import { User } from '../../models/user'

describe('routes: user', () => {
  const usersBaseUrl = '/users'
  const request = supertest(app)
  let token = ''
  let userDb: User = {
    firstname: 'mo',
    lastname: 'han',
    username: 'mohan',
    password: 'mohanpsw'
  }
  beforeAll(async () => {
    //add new user and get the token
    const res = await request.post(`${usersBaseUrl}`).send({
      ...userDb
    })
    const sql =
      'select  id, firstname, lastname, username from users where username=($1)'
    //**get newlly created user data */
    const conn = await Client.connect()
    const { rows } = await conn.query(sql, ['mohan'])
    userDb = rows[0]
    conn.release()
    token = res.body.data.token
  })
  afterAll(async () => {
    //**remove all data in users table */
    const sql = 'TRUNCATE TABLE users CASCADE'
    const conn = await Client.connect()
    await conn.query(sql)
    conn.release()
  })
  describe('GET .../users', () => {
    it('should response with 401 when user is not authorized', async () => {
      const res = await request.get(usersBaseUrl)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('invalid token, log in and try again')
    })
    it('should response with 200 && array of users when user is authorized', async () => {
      const res = await request
        .get(usersBaseUrl)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBe(1)
    })
  })
  describe('GET .../users/:user_id', () => {
    it('should response with 401 when user is not authorized', async () => {
      const res = await request.get(`${usersBaseUrl}/1`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('invalid token, log in and try again')
    })
    it('should response with 200 && userTarget info when user is authorized and target user exist', async () => {
      const res = await request
        .get(`${usersBaseUrl}/${userDb.id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data).toEqual(userDb)
    })
    it('should response with 404 when user is authorized and targeted user not found', async () => {
      //** we increment the id of the only user in users table to ensure request non existing user  */
      const res = await request
        .get(`${usersBaseUrl}/${(userDb.id as number) + 1}`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('fail')
      expect(res.body.message).toEqual(
        `user with id: ${(userDb.id as number) + 1} not found`
      )
    })
    it('should response with 400 when user is authorized and provided user id not a number', async () => {
      const res = await request
        .get(`${usersBaseUrl}/im_not_a_number`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('fail')
      expect(res.body.message).toEqual(`invalid user id`)
    })
  })
  describe('POST .../users', () => {
    it('should response with 400 bad request when provided username already exist', async () => {
      const user = {
        firstname: 'mo2',
        lastname: 'han2',
        username: 'mohan',
        password: 'mohanpsw'
      }
      const res = await request.post(`${usersBaseUrl}`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('bad request')
    })
    it('should response with 400 when any of required fields is missing', async () => {
      const user = {
        lastname: 'han2',
        username: 'mohan',
        password: 'mohanpsw'
      }
      const res = await request.post(`${usersBaseUrl}`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('not all required fields where provided')
    })
    it('should response with 200 and user token when all required fields are provided', async () => {
      const user = {
        firstname: 'mo2',
        lastname: 'han2',
        username: 'mohan2',
        password: 'mohanpsw'
      }
      const res = await request.post(`${usersBaseUrl}`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.token).not.toBeNull()
    })
  })
  describe('POST .../users/login', () => {
    it('should response with 400 when any of required fields username or password is missing', async () => {
      const user = {
        password: 'mohanpsw'
      }
      const res = await request.post(`${usersBaseUrl}/login`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('not all required fields where provided')
    })
    it('should response with 401 when password or username are incorrect', async () => {
      const user = {
        username: 'mohan',
        password: 'im_a_wrong_password'
      }
      const res = await request.post(`${usersBaseUrl}/login`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('username or password is incorrect!')
    })
    it('should response with 200 and user token when all required fields are provided', async () => {
      const user = {
        username: 'mohan',
        password: 'mohanpsw'
      }
      const res = await request.post(`${usersBaseUrl}/login`).send({ ...user })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.token).not.toBeNull()
    })
  })
})
