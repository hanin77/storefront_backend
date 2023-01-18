import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import userRoutes from './routes/usersRoutes'

const app: express.Application = express()
const address = '0.0.0.0:3000'

app.use(bodyParser.json())

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!')
})
app.use('/users', userRoutes)
app.all('*', (req, res) => {
  return res.status(404).json(`Can't find ${req.originalUrl} on this server!`)
})
app.listen(3000, function () {
  console.log(`starting app on: ${address}`)
})
export default app
