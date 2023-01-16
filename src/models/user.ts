import Client from '../database'
import bcrypt from 'bcrypt'

const saltRounds = process.env.SALT_ROUNDS
const pepper = process.env.BCRYPT_PASSWORD

export type User = {
  id?: number
  firstname: string
  lastname: string
  username: string
  password: string
}

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await Client.connect()
      const sql = 'SELECT id, username,firstname,lastname FROM users'

      const result = await conn.query(sql)

      conn.release()

      return result.rows
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`)
    }
  }
  async show(id: string): Promise<User> {
    try {
      const sql =
        'SELECT id, username,firstname,lastname FROM users WHERE id=($1)'
      const conn = await Client.connect()

      const result = await conn.query(sql, [id])

      conn.release()

      return result.rows[0]
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`)
    }
  }
  async create(u: User): Promise<User> {
    try {
      const conn = await Client.connect()
      const sql =
        'INSERT INTO users (firstname, lastname, username, password) VALUES($1, $2, $3, $4) RETURNING *'
      const hash = bcrypt.hashSync(
        u.password + pepper,
        parseInt(saltRounds || '10')
      )
      const result = await conn.query(sql, [
        u.firstname,
        u.lastname,
        u.username,
        hash
      ])
      const user = result?.rows[0]
      conn.release()
      return user
    } catch (err) {
      throw new Error(`unable to create user (${u.username}): ${err}`)
    }
  }
  async authenticate(username: string, password: string): Promise<User | null> {
    const conn = await Client.connect()
    const sql = 'SELECT id, password, username FROM users WHERE username=($1)'
    const result = await conn.query(sql, [username])
    conn.release()
    if (result.rows.length) {
      const user = result.rows[0]
      if (bcrypt.compareSync(password + pepper, user.password)) {
        return user
      }
    }
    return null
  }
}
