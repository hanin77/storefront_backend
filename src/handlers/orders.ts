/* eslint-disable no-use-before-define */
import { Request, Response } from 'express'
import { OrderStore } from '../models/order'

const store = new OrderStore()

const userCurrentActiveOrder = async (_req: Request, res: Response) => {
  const { id } = _req.params
  try {
    const order = await store.getUserCurrentActiveOrder(id as unknown as number)
    if (order) {
      return res.json({ status: 'success', data: order })
    }
    return res.status(404).json({
      status: 'fail',
      message: `user with id: ${id} has no current active orders`
    })
  } catch (err) {
    return res.json({ status: 'fail', message: err })
  }
}

export default { userCurrentActiveOrder }
