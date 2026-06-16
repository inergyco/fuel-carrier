import { relations } from 'drizzle-orm';
import { admins } from './admins';
import { users } from './users';

export const usersRelations = relations(users, ({ one }) => ({
  admin: one(admins, {
    fields: [users.id],
    references: [admins.userId],
  }),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, {
    fields: [admins.userId],
    references: [users.id],
  }),
}));
