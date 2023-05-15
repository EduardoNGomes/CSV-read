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

  const responseDBpacks = await knex
    .select(
      'products.name',
      'products.code',
      'products.cost_price',
      'products.sales_price',
      'packs.product_id',
      'packs.qty'
    )
    .from('products')
    .leftJoin('packs', 'products.code', '=', 'packs.pack_id')

  const { file } = req

  const invalidEntries = []
  const updatedData = []
  const resEntry = []

  fs.readFile(`./${file.path}`, async (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    const resEntryData = await neatCsv(data)
    resEntry.push(resEntryData)

    // code
    // sales_price
    // product_code
    // new_price

    for await (let itemEntry of resEntry) {
      for await (let itemDB of responseDB) {
        // Comparando codigo enviado pelo criando com codigo do produto do banco
        if (itemEntry.product_code == JSON.parse(JSON.stringify(itemDB)).code) {
          // Validando se o novo preco e maior do que o preco de custo
          if (itemEntry.new_price < itemDB.cost_price) {
            invalidEntries.push({
              ...itemEntry,
              message: 'Novo preço menor do que o valor de custo do produto'
            })
            break
          }

          // Validar se aumento e maior do que 10%
          const itemWithTenPercent =
            itemDB.sales_price + (itemDB.sales_price / 100) * 10

          if (itemEntry.new_price > itemWithTenPercent) {
            invalidEntries.push({
              ...itemEntry,
              message:
                'Novo preço tem um aumento maior do que 10% do preço anterior'
            })
            break
          }

          // Validar se aumento e maior do que 10%
          const itemWithoutTenPercent =
            itemDB.sales_price - (itemDB.sales_price / 100) * 10
          if (itemEntry.new_price < itemWithoutTenPercent) {
            invalidEntries.push({
              ...itemEntry,
              message:
                'Novo preço tem um aumento menor do que 10% do preço anterior'
            })
            break
          }

          updatedData.push({
            code: itemDB.code,
            name: itemDB.name,
            current_price: itemDB.sales_price,
            new_price: itemEntry.new_price
          })
        }
      }
    }
  })
  setTimeout(() => {
    console.log(updatedData, invalidEntries)
    return res.send()
  }, 500)

  return res.send(resEntry)
})

app.listen(3333, () => {
  console.log('server is running')
})
