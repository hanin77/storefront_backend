import express from 'express'
import orderHandler from '../handlers/orders'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { protect } from '../handlers/helpers'
const router = express.Router()

router.get('/users/:id', protect, orderHandler.userCurrentActiveOrder)
export default router
