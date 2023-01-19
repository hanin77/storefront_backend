import Client from '../database'

export type Product = {
  id?: number
  name: string
  price: number
  category?: string
}

export class ProductStore {
  async index(category?: string): Promise<Product[]> {
    try {
      const conn = await Client.connect()
      if (category) {
        const sql = 'SELECT * FROM products WHERE category=($1)'

        const result = await conn.query(sql, [category])

        conn.release()

        return result.rows
      }
      const sql = 'SELECT * FROM products'

      const result = await conn.query(sql)

      conn.release()

      return result.rows
    } catch (err) {
      throw new Error(`Could not get Products. Error: ${err}`)
    }
  }
  async show(id: string): Promise<Product> {
    try {
      const sql = 'SELECT * FROM products WHERE id=($1)'
      const conn = await Client.connect()

      const result = await conn.query(sql, [id])

      conn.release()

      return result.rows[0]
    } catch (err) {
      throw new Error(`Could not find product ${id}. Error: ${err}`)
    }
  }
  async create(p: Product): Promise<Product> {
    try {
      const conn = await Client.connect()
      const sql =
        'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *'
      //category is optional if the provided value is undefined it will be set to null
      const result = await conn.query(sql, [p.name, p.price, p.category])
      const Product = result?.rows[0]
      conn.release()
      return Product
    } catch (err) {
      throw new Error(`unable to create product (${p.name}): ${err}`)
    }
  }
}
