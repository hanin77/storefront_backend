import express from 'express'
import productHandler from '../handlers/products'
import { protect } from '../handlers/helpers'
const router = express.Router()

router.get('/:id', productHandler.show)
router.get('/', productHandler.index)
router.post('/', protect, productHandler.create)
export default router
