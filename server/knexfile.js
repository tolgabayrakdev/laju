import { env } from './src/config/env.js';

/** @type {import('knex').Knex.Config} */
export default {
  client: 'pg',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  },
  migrations: {
    directory: './migrations',
    extension: 'js',
  },
};
