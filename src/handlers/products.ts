/* eslint-disable no-use-before-define */
import { Request, Response } from 'express'
import { ProductStore } from '../models/product'

const store = new ProductStore()

const index = async (_req: Request, res: Response) => {
  const { category } = _req.query
  const products = await store.index(category as string)
  return res.json({ status: 'success', data: products })
}

const show = async (_req: Request, res: Response) => {
  if (_req.params.id && parseInt(_req.params.id)) {
    const product = await store.show(_req.params.id)
    if (product) {
      return res.status(200).json({ status: 'success', data: product })
    }
    return res.status(404).json({
      status: 'fail',
      message: `product with id: ${_req.params.id} not found`
    })
  }
  return res.status(400).json({
    status: 'fail',
    message: 'invalid product id'
  })
}

const create = async (req: Request, res: Response) => {
  const { name, price, category } = req.body
  if (name && price) {
    try {
      const newProduct = await store.create({
        name,
        price,
        category
      })
      return res.status(200).json({ status: 'success', data: newProduct })
    } catch (err) {
      return res.status(400).json({ status: 'fail', message: 'bad request' })
    }
  }
  return res
    .status(400)
    .json({ status: 'fail', message: 'not all required fields where provided' })
}

export default {
  index,
  show,
  create
}
