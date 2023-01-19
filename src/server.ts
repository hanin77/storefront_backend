import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import userRoutes from './routes/usersRoutes'
import productRoutes from './routes/productsRoutes'
import orderRoutes from './routes/ordersRoutes'

const app: express.Application = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!')
})
app.use('/users', userRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.all('*', (req, res) => {
  return res.status(404).json(`Can't find ${req.originalUrl} on this server!`)
})
app.listen(port, function () {
  console.log(`starting app on port : ${port}`)
})
export default app
