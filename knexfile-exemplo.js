import Knex from 'knex'

export const knex = Knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: 'YOUR_PORT',
    user: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',
    database: 'YOUR_DBNAME'
  }
})
