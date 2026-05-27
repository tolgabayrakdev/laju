import 'dotenv/config';

/** @type {import('knex').Knex.Config} */
export default {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'laju_db',
  },
  migrations: {
    directory: './migrations',
    extension: 'js',
  },
};
