/* eslint-disable no-use-before-define */
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserStore } from '../models/user'
import { protect } from './helpers'
const store = new UserStore()

const index = async (_req: Request, res: Response) => {
  const users = await store.index()
  return res.json({ status: 'success', data: users })
}

const show = async (_req: Request, res: Response) => {
  if (_req.params.id && parseInt(_req.params.id)) {
    const user = await store.show(_req.params.id)
    if (user) {
      return res.status(200).json({ status: 'success', data: user })
    }
    return res.status(404).json({
      status: 'fail',
      message: `user with id: ${_req.params.id} not found`
    })
  }
  return res.status(400).json({
    status: 'fail',
    message: 'invalid user id'
  })
}

const create = async (req: Request, res: Response) => {
  const { firstname, lastname, username, password } = req.body
  if (firstname && lastname && username && password) {
    try {
      const newUser = await store.create({
        firstname,
        lastname,
        username,
        password
      })
      const token = jwt.sign(
        { id: newUser.id },
        process.env.TOKEN_SECRET as string
      )
      return res.status(200).json({ status: 'success', data: { token } })
    } catch (err) {
      return res.status(400).json({ status: 'fail', message: 'bad request' })
    }
  }
  return res
    .status(400)
    .json({ status: 'fail', message: 'not all required fields where provided' })
}

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (username && password) {
    try {
      const u = await store.authenticate(username, password)
      if (u) {
        const token = jwt.sign({ id: u.id }, process.env.TOKEN_SECRET as string)
        return res.status(200).json({ status: 'success', data: { token } })
      }
      return res
        .status(401)
        .json({ status: 'fail', message: 'username or password is incorrect!' })
    } catch (error) {
      return res.status(401).json({ error })
    }
  }
  return res
    .status(400)
    .json({ status: 'fail', message: 'not all required fields where provided' })
}

export default {
  index,
  login,
  show,
  create,
  protect
}
