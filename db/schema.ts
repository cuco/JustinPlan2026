import {integer,sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const progress=sqliteTable('progress',{
 userId:text('user_id').notNull(),
 key:text('key').notNull(),
 value:integer('value').notNull(),
 updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.userId,t.key]})]);
