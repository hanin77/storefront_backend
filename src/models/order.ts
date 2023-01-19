import Client from '../database'

export type ProductQ = {
  id?: number
  name: string
  price: number
  quantity: number
}
export type Order = {
  id?: number
  status: boolean
  user_id: number
  products: ProductQ[]
}

export class OrderStore {
  async getUserCurrentActiveOrder(id: number) {
    try {
      const conn = await Client.connect()
      const sql = `SELECT o.id as id, o.status as status, o.user_id as user_id, 
                        op.product_id as product_id,p.name as name,p.price as price,
                        op.quantity as quantity
                        FROM orders o join order_products op on op.order_id = o.id 
                        join products p on p.id = op.product_id
                        WHERE user_id = ($1) and status = true
        `
      const { rows } = await conn.query(sql, [id])
      if (rows && rows.length) {
        const userOrder: Order = {
          id: rows[0].id,
          status: true,
          user_id: id,
          products: []
        }
        rows.forEach((item) => {
          userOrder.products.push({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })
        })
        conn.release()
        return userOrder
      }

      conn.release()

      return null
    } catch (err) {
      throw new Error(
        `Could not get current active order for user ${id}. Error: ${err}`
      )
    }
  }
}
