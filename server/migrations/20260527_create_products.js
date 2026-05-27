/** @param {import('knex').Knex} knex */
export const up = (knex) =>
  knex.schema.createTable('products', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.decimal('price', 10, 2).notNullable();
    t.integer('stock').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });


export const down = (knex) => knex.schema.dropTable('products');
