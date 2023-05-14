import express from 'express'
import { knex } from './knexfile.js'
import neatCsv from 'neat-csv'
import multer from 'multer'
import fs from 'fs'

const app = express()

app.use(express.json())

const upload = multer({
  dest: './tmp'
})

app.post('/test', upload.single('file'), async (req, res) => {
  const responseDB = await knex('products')
  const { file } = req

  const invalidEntries = []

  fs.readFile(`./${file.path}`, async (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    const resEntry = await neatCsv(data)

    // code
    // sales_price
    // product_code
    // new_price

    for await (let itemEntry of resEntry) {
      for (let itemDB of responseDB) {
        // Object.values(JSON.parse(JSON.stringify(rows)));
        // console.log(JSON.parse(JSON.stringify(itemDB)))
        if (itemEntry.product_code == JSON.parse(JSON.stringify(itemDB)).code) {
          // Validando se o novo preco e maior do que o preco de custo
          if (itemEntry.new_price < itemDB.cost_price) {
            invalidEntries.push({
              ...itemEntry,
              message: 'Novo preço menor do que o valor de custo do produto'
            })
          }

          // Validar se aumento e maior do que 10%
          const itemWithTenPercent =
            itemDB.itemDB.cost_price + (itemDB.sales_price / 100) * 10
          if (itemEntry.new_price > itemWithTenPercent) {
            invalidEntries.push({
              ...itemEntry,
              message:
                'Novo preço tem um aumento maior do que 10% do preço anterior'
            })
          }
        }
      }
    }
  })

  setTimeout(() => {
    console.log(invalidEntries)
    return res.send('oi')
  }, 2000)
})

app.listen(3333, () => {
  console.log('server is running')
})
