/** @param {import('knex').Knex} knex */
export const up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password').notNullable();
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTable('users');
