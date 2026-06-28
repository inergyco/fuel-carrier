import { relations } from 'drizzle-orm';
import { admins } from './admins';
import { auditLogs } from './audit-logs';
import { cars } from './cars';
import { companies } from './companies';
import { companyUsers } from './company-users';
import { drivers } from './drivers';
import { users } from './users';

export const usersRelations = relations(users, ({ one, many }) => ({
  admin: one(admins, {
    fields: [users.id],
    references: [admins.userId],
  }),
  companyUser: one(companyUsers, {
    fields: [users.id],
    references: [companyUsers.userId],
  }),
  auditLogs: many(auditLogs),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, {
    fields: [admins.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  drivers: many(drivers),
  cars: many(cars),
  companyUsers: many(companyUsers),
  auditLogs: many(auditLogs),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const driversRelations = relations(drivers, ({ one }) => ({
  company: one(companies, {
    fields: [drivers.companyId],
    references: [companies.id],
  }),
  car: one(cars, {
    fields: [drivers.id],
    references: [cars.driverId],
  }),
}));

export const carsRelations = relations(cars, ({ one }) => ({
  company: one(companies, {
    fields: [cars.companyId],
    references: [companies.id],
  }),
  driver: one(drivers, {
    fields: [cars.driverId],
    references: [drivers.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  company: one(companies, {
    fields: [auditLogs.companyId],
    references: [companies.id],
  }),
  actorUser: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));
