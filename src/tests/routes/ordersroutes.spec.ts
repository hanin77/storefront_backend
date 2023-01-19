import supertest from 'supertest'
import app from '../../server'
import Client from '../../database'
import { User } from '../../models/user'
import { Product, ProductStore } from '../../models/product'
describe('routes: products', () => {
  const ordersBaseUrl = '/orders'
  const ProductStoreInstance = new ProductStore()
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
  const productsDb: Product[] = []
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
    //add products
    productsDb.push(await ProductStoreInstance.create(products[0]))
    productsDb.push(await ProductStoreInstance.create(products[1]))
    productsDb.push(await ProductStoreInstance.create(products[2]))
    productsDb.push(await ProductStoreInstance.create(products[3]))
    conn.release()
    token = res.body.data.token
  })
  afterAll(async () => {
    const conn = await Client.connect()
    //**remove all data in users table */
    await conn.query('TRUNCATE TABLE users CASCADE')
    await conn.query('TRUNCATE TABLE products CASCADE')
    conn.release()
  })
  afterEach(async () => {
    const conn = await Client.connect()
    //**remove all data in products table */
    await conn.query('TRUNCATE TABLE orders CASCADE')
    conn.release()
  })
  describe('GET .../orders/users/:user-id', () => {
    it('should response with 200 && requested user order info', async () => {
      const conn = await Client.connect()
      //create orders
      const { rows: activeOrder } = await conn.query(
        'INSERT INTO orders(status,user_id) VALUES($1,$2) RETURNING *',
        [true, userDb.id]
      )
      const { rows: inactiveOrder } = await conn.query(
        'INSERT INTO orders(status,user_id) VALUES($1,$2) RETURNING *',
        [false, userDb.id]
      )
      //add products to active order
      await conn.query(
        'INSERT INTO order_products(quantity, order_id, product_id) VALUES($1,$2, $3) RETURNING *',
        [30, activeOrder[0].id, productsDb[0].id]
      )
      await conn.query(
        'INSERT INTO order_products(quantity, order_id, product_id) VALUES($1,$2, $3) RETURNING *',
        [30, activeOrder[0].id, productsDb[1].id]
      )
      //add products to inactive order
      await conn.query(
        'INSERT INTO order_products(quantity, order_id, product_id) VALUES($1,$2, $3) RETURNING *',
        [30, inactiveOrder[0].id, productsDb[2].id]
      )
      conn.release()
      const res = await request
        .get(`${ordersBaseUrl}/users/${userDb.id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.products.length).toBe(2)
      expect(res.body.data.user_id * 1).toBe(userDb.id as number)
      expect(res.body.data.id).toBe(activeOrder[0].id)
      expect(res.body.data.status).toBe(activeOrder[0].status)
    })
    it('should response with 401 when user is not authorized', async () => {
      //** we increment the id of the only product in users table to ensure request non existing product  */
      const res = await request.get(`${ordersBaseUrl}/users/1`)
      expect(res.type).toEqual('application/json')
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('fail')
      expect(res.body.message).toEqual(`invalid token, log in and try again`)
    })
  })
})
