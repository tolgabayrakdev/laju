/** @param {import('knex').Knex} knex */
export const up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.text('reset_token').nullable();
    t.timestamp('reset_token_expires').nullable();
  });

export const down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.dropColumn('reset_token');
    t.dropColumn('reset_token_expires');
  });
