import { Product, ProductStore } from '../../models/product'
import Client from '../../database'
const ProductStoreInstance = new ProductStore()

describe('Product Model', () => {
  const product: Product = {
    name: 'product1',
    price: 10,
    category: 'CAT99'
  }
  afterEach(async () => {
    const sql = 'TRUNCATE TABLE products CASCADE'
    const conn = await Client.connect()
    await conn.query(sql)
    conn.release()
  })
  it('should have an index method', () => {
    expect(ProductStoreInstance.index).toBeDefined()
  })

  it('should have a create method', () => {
    expect(ProductStoreInstance.create).toBeDefined()
  })
  it('should have a show method', () => {
    expect(ProductStoreInstance.show).toBeDefined()
  })
  describe('show method', async () => {
    it('should return product when found', async () => {
      const productDb: Product = await ProductStoreInstance.create(product)
      const result = await ProductStoreInstance.show(
        productDb.id as unknown as string
      )
      expect(result.name).toEqual(productDb.name)
      expect(result.price).toEqual(productDb.price)
      expect(result.category).toEqual(productDb.category)
      expect(result.id).toEqual(productDb.id)
    })
    it('should return undefined when the Product not found', async () => {
      const productDb: Product = await ProductStoreInstance.create(product)
      const result = await ProductStoreInstance.show(
        ((productDb.id as number) + 1) as unknown as string
      )
      expect(result).toBeUndefined()
    })
  })
  describe('ceate method', () => {
    it('should create a new product', async () => {
      const newProduct: Product = await ProductStoreInstance.create(product)
      const { name, price, category } = newProduct
      expect(name).toBe(product.name)
      expect(price).toBe(product.price)
      expect(category).toBe(product.category)
    })
    it('should thorw error when name or price is messing', async () => {
      await expectAsync(
        ProductStoreInstance.create({ price: 20 } as Product)
      ).toBeRejectedWithError()
      await expectAsync(
        ProductStoreInstance.create({ name: 'p2' } as Product)
      ).toBeRejectedWithError()
    })
  })

  describe('index method', async () => {
    it('should return empty array when no product found', async () => {
      const result = await ProductStoreInstance.index()
      expect(result.length).toEqual(0)
    })
    it('should return an array of all products', async () => {
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
      const p1 = await ProductStoreInstance.create(products[0])
      const p2 = await ProductStoreInstance.create(products[1])
      const p3 = await ProductStoreInstance.create(products[2])
      const p4 = await ProductStoreInstance.create(products[3])
      const result: Product[] = await ProductStoreInstance.index()
      expect(result.length).toEqual(4)
      expect(result).toEqual([p1, p2, p3, p4])
    })
    it('should return an array of all products belonging to the provided category', async () => {
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
      const p1 = await ProductStoreInstance.create(products[0])
      const p2 = await ProductStoreInstance.create(products[1])
      await ProductStoreInstance.create(products[2])
      await ProductStoreInstance.create(products[3])

      const result: Product[] = await ProductStoreInstance.index('CAT 20')
      expect(result.length).toEqual(2)
      expect(result).toEqual([p1, p2])
    })
  })
})
