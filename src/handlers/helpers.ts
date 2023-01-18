/* eslint-disable no-use-before-define */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserStore } from '../models/user'

const store = new UserStore()
//** middlware to restrict routes to only logged users */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization
    if (authorizationHeader) {
      //return res.status(200).json({ data: 22 }) //typeof decoded.id })
      const token = authorizationHeader.split(' ')[1]
      //return res.status(200).json({ data: token }) //typeof decoded.id })
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string)
      const { id } = decoded as jwt.JwtPayload
      const user = await store.show(id)
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'invalid token log in and try again'
        })
      }
      //**valid token, move to next middlware*/
      return next()
    } else {
      throw new Error('authorization header not found')
    }
  } catch (err) {
    return res
      .status(401)
      .json({ status: 'fail', message: 'invalid token, log in and try again' })
  }
}
