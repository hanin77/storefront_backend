import express from 'express'
import userHandler from '../handlers/users'
const router = express.Router()

router.post('/login', userHandler.login)
router.get('/:id', userHandler.protect, userHandler.show)
router.get('/', userHandler.protect, userHandler.index)
router.post('/', userHandler.create)
export default router
