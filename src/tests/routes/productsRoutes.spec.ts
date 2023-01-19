import supertest from 'supertest'
import app from '../../server'
import Client from '../../database'
import { User } from '../../models/user'

describe('routes: products', () => {
  const productsBaseUrl = '/products'
  const request = supertest(app)
  const products = [
    {
      name: 'product 1',
      price: 30,
      category: 'CAT 20'
    },
    {
      name: 'product 2',
      price: 12,
      category: 'CAT 20'
    },
    {
      name: 'product 3',
      price: 30,
      category: 'CAT 23'
    },
    {
      name: 'product 4',
      price: 12,
      category: 'CAT 40'
    }
  ]
  let token = ''
  let userDb: User = {
    firstname: 'mo',
    lastname: 'han',
    username: 'mohan',
    password: 'mohanpsw'
  }
  beforeAll(async () => {
    //add new user and get the token
    const res = await request.post(`/users`).send({
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
    const conn = await Client.connect()
    //**remove all data in users table */
    await conn.query('TRUNCATE TABLE users CASCADE')
    conn.release()
  })
  afterEach(async () => {
    const conn = await Client.connect()
    //**remove all data in products table */
    await conn.query('TRUNCATE TABLE products CASCADE')
    conn.release()
  })
  describe('GET .../products', () => {
    it('should respond with 200 && empty array  when no products found', async () => {
      const res = await request.get(productsBaseUrl)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBe(0)
    })
    it('should respond with 200 && an array of products', async () => {
      const conn = await Client.connect()
      //**insert products data */
      const { rows } = await conn.query(
        `INSERT INTO products(name, price, category) VALUES 
            ('${products[0].name}', '${products[0].price}', '${products[0].category}'),
            ('${products[1].name}', '${products[1].price}', '${products[1].category}'),
            ('${products[2].name}', '${products[2].price}', '${products[2].category}'),
            ('${products[3].name}', '${products[3].price}', '${products[3].category}') 
            RETURNING *`
      )
      conn.release()
      const res = await request.get(productsBaseUrl)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBe(4)
      expect(res.body.data).toEqual(rows)
    })
    it('should respond with 200 && an array of products with the requested category ', async () => {
      const conn = await Client.connect()
      //**insert products data */
      const { rows } = await conn.query(
        `INSERT INTO products(name, price, category) VALUES 
              ('${products[0].name}', '${products[0].price}', '${products[0].category}'),
              ('${products[1].name}', '${products[1].price}', '${products[1].category}'),
              ('${products[2].name}', '${products[2].price}', '${products[2].category}'),
              ('${products[3].name}', '${products[3].price}', '${products[3].category}') 
              RETURNING *`
      )
      conn.release()
      const res = await request.get(
        `${productsBaseUrl}?category=${products[0].category}`
      )
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBe(
        rows.filter((pro) => pro.category === products[0].category).length
      )
      expect(res.body.data).toEqual([
        ...rows.filter((pro) => pro.category === products[0].category)
      ])
    })
  })
  describe('GET .../products/:product_id', () => {
    it('should response with 200 && requested product info when product exist', async () => {
      const conn = await Client.connect()
      //**insert products data */
      const { rows } = await conn.query(
        `INSERT INTO products(name, price, category) VALUES 
              ('${products[0].name}', '${products[0].price}', '${products[0].category}')
              RETURNING *`
      )
      conn.release()
      const res = await request.get(`${productsBaseUrl}/${rows[0].id}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data).toEqual(rows[0])
    })
    it('should response with 404 when user is authorized and targeted user not found', async () => {
      const conn = await Client.connect()
      //**insert products data */
      const { rows } = await conn.query(
        `INSERT INTO products(name, price, category) VALUES 
                ('${products[0].name}', '${products[0].price}', '${products[0].category}')
                RETURNING *`
      )
      conn.release()
      //** we increment the id of the only product in users table to ensure request non existing product  */
      const res = await request.get(
        `${productsBaseUrl}/${(rows[0].id as number) + 1}`
      )
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('fail')
      expect(res.body.message).toEqual(
        `product with id: ${(rows[0].id as number) + 1} not found`
      )
    })
    it('should response with 400 when provided product id not a number', async () => {
      const res = await request
        .get(`${productsBaseUrl}/im_not_a_number`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('fail')
      expect(res.body.message).toEqual(`invalid product id`)
    })
  })
  describe('POST .../products', () => {
    it('should response with 401 when provided user not authorized', async () => {
      const product = {
        name: 'product 77',
        price: 77,
        category: 'CAT 77'
      }
      const res = await request.post(`${productsBaseUrl}`).send({ ...product })
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('invalid token, log in and try again')
    })
    it('should response with 200 and created product data when all required fields are provided and user authorized', async () => {
      const res = await request
        .post(`${productsBaseUrl}`)
        .send({ ...products[0] })
        .set('Authorization', `Bearer ${token}`)
      const conn = await Client.connect()
      const { rows: productDb } = await conn.query('SELECT * from products')
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data).toEqual({ ...productDb[0] })
    })
    it('should response with 400 when user authorized and product name or price are not provided', async () => {
      const res1 = await request
        .post(`${productsBaseUrl}`)
        .send({ name: 'P1', category: 'CAT1' })
        .set('Authorization', `Bearer ${token}`)
      const res2 = await request
        .post(`${productsBaseUrl}`)
        .send({ price: 20, category: 'CAT1' })
        .set('Authorization', `Bearer ${token}`)
      expect(res1.type).toEqual('application/json')
      expect(res1.status).toBe(400)
      expect(res1.body.status).toBe('fail')
      expect(res1.body.message).toBe('not all required fields where provided')
      expect(res2.type).toEqual('application/json')
      expect(res2.status).toBe(400)
      expect(res2.body.status).toBe('fail')
      expect(res2.body.message).toBe('not all required fields where provided')
    })
  })
})
