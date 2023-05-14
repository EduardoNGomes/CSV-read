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
  // const response = await knex('products')

  const { file } = req
  console.log(file)
  fs.readFile(`./${file.path}`, async (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    console.log(await neatCsv(data))
  })
  return res.send()
})

app.listen(3333, () => {
  console.log('server is running')
})
