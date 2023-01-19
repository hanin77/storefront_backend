import { User, UserStore } from '../../models/user'
import Client from '../../database'
const UserStoreInstance = new UserStore()

describe('User Model', () => {
  const user: User = {
    username: 'mohan1',
    firstname: 'mo1',
    lastname: 'han1',
    password: 'password123'
  }
  afterEach(async () => {
    const sql = 'TRUNCATE TABLE users CASCADE'
    const conn = await Client.connect()
    await conn.query(sql)
    conn.release()
  })
  it('should have an index method', () => {
    expect(UserStoreInstance.index).toBeDefined()
  })

  it('should have a create method', () => {
    expect(UserStoreInstance.create).toBeDefined()
  })
  it('should have a show method', () => {
    expect(UserStoreInstance.show).toBeDefined()
  })
  it('should have an authenticate method', () => {
    expect(UserStoreInstance.authenticate).toBeDefined()
  })
  describe('ceate method', () => {
    it('should create a new user', async () => {
      const newUser: User = await UserStoreInstance.create(user)
      const { username, firstname, lastname } = newUser
      expect(username).toBe(user.username)
      expect(firstname).toBe(user.firstname)
      expect(lastname).toBe(user.lastname)
    })
    it('should throw error when the provided username already belong to another user', async () => {
      await UserStoreInstance.create(user)
      await expectAsync(UserStoreInstance.create(user)).toBeRejectedWithError(
        `unable to create user (${user.username}): error: duplicate key value violates unique constraint "users_username_key"`
      )
    })
  })

  describe('index method', async () => {
    it('should return empty array when no user found', async () => {
      const result = await UserStoreInstance.index()
      expect(result.length).toEqual(0)
    })
    it('should return an array of all users', async () => {
      await UserStoreInstance.create({
        username: 'mohan1',
        firstname: 'mo1',
        lastname: 'han1',
        password: 'password123'
      })
      await UserStoreInstance.create({
        username: 'mohan2',
        firstname: 'mo2',
        lastname: 'han2',
        password: 'password123'
      })
      const result: User[] = await UserStoreInstance.index()
      expect(result.length).toEqual(2)
      expect(result[0]).toEqual(
        jasmine.objectContaining({
          username: 'mohan1',
          firstname: 'mo1',
          lastname: 'han1'
        })
      )
    })
  })
  describe('show method', async () => {
    it('should return user when found', async () => {
      const userTarget: User = await UserStoreInstance.create(user)
      const result = await UserStoreInstance.show(
        userTarget.id as unknown as string
      )
      expect(result.username).toEqual(userTarget.username)
      expect(result.firstname).toEqual(userTarget.firstname)
      expect(result.lastname).toEqual(userTarget.lastname)
      expect(result.id).toEqual(userTarget.id)
    })
    it('should return undefined when the user not found', async () => {
      await UserStoreInstance.create(user)
      const result = await UserStoreInstance.show('99')
      expect(result).toBeUndefined()
    })
  })
  describe('authenticate method', async () => {
    it('should return user when password correct', async () => {
      const userTarget: User = await UserStoreInstance.create(user)
      const result = (await UserStoreInstance.authenticate(
        user.username,
        user.password
      )) as unknown as User
      expect(result.username).toEqual(userTarget.username)
    })
    it('should return null when the user password incorrect', async () => {
      await UserStoreInstance.create(user)
      const result = await UserStoreInstance.authenticate(
        user.username,
        'wrong password'
      )
      expect(result).toBeNull()
    })
  })
})
