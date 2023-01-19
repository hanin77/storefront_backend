import { Product, ProductStore } from '../../models/product'
import { Order, OrderStore } from '../../models/order'
import Client from '../../database'
import { User, UserStore } from '../../models/user'
const UserStoreInstance = new UserStore()
const ProductStoreInstance = new ProductStore()
const OrderStoreInstance = new OrderStore()

describe('Order Model', () => {
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
  const user: User = {
    username: 'mohan1',
    firstname: 'mo1',
    lastname: 'han1',
    password: 'password123'
  }
  let userDb: User
  beforeAll(async () => {
    const conn = await Client.connect()
    //add products
    productsDb.push(await ProductStoreInstance.create(products[0]))
    productsDb.push(await ProductStoreInstance.create(products[1]))
    productsDb.push(await ProductStoreInstance.create(products[2]))
    productsDb.push(await ProductStoreInstance.create(products[3]))
    //add user
    userDb = await UserStoreInstance.create(user)
    conn.release()
  })
  afterEach(async () => {
    const sql = 'TRUNCATE  orders CASCADE'
    const conn = await Client.connect()
    await conn.query(sql)
    conn.release()
  })
  it('should have an userCurrentActiveOrder method', () => {
    expect(OrderStoreInstance.getUserCurrentActiveOrder).toBeDefined()
  })

  describe('getUserCurrentActiveOrder method', async () => {
    it('should return null when user has no current active order', async () => {
      const result = await OrderStoreInstance.getUserCurrentActiveOrder(
        userDb.id as number
      )
      expect(result).toBeNull()
    })
    it('should return user active current order', async () => {
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

      const result = await OrderStoreInstance.getUserCurrentActiveOrder(
        userDb.id as number
      )
      expect(result?.products.length).toBe(2)
      expect(result?.user_id).toBe(userDb.id)
      expect(result?.id).toBe(activeOrder[0].id)
      expect(result?.status).toBe(activeOrder[0].status)
    })
  })
})
