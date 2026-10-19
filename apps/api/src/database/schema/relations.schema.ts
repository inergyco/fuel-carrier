import { relations } from 'drizzle-orm';
import { admins } from './admins.schema';
import { auditLogs } from './audit-logs.schema';
import { carDriverAssignments } from './car-driver-assignments.schema';
import { carTelemetryHistory } from './car-telemetry-history.schema';
import { cars } from './cars.schema';
import { companies } from './companies.schema';
import { companyUsers } from './company-users.schema';
import { drivers } from './drivers.schema';
import { mqttAcls } from './mqtt-acls.schema';
import { mqttClients } from './mqtt-clients.schema';
import {
  notificationDeliveries,
  notificationPushSubscriptions,
  notifications,
} from './notifications.schema';
import { users } from './users.schema';

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
  carDriverAssignments: many(carDriverAssignments),
  notifications: many(notifications),
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
  carDriverAssignments: many(carDriverAssignments),
  carTelemetryHistory: many(carTelemetryHistory),
  notificationDeliveries: many(notificationDeliveries),
  notificationPushSubscriptions: many(notificationPushSubscriptions),
}));

export const companyUsersRelations = relations(
  companyUsers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [companyUsers.userId],
      references: [users.id],
    }),
    company: one(companies, {
      fields: [companyUsers.companyId],
      references: [companies.id],
    }),
    notificationDeliveries: many(notificationDeliveries),
    notificationPushSubscriptions: many(notificationPushSubscriptions),
  }),
);

export const driversRelations = relations(drivers, ({ one, many }) => ({
  company: one(companies, {
    fields: [drivers.companyId],
    references: [companies.id],
  }),
  car: one(cars, {
    fields: [drivers.id],
    references: [cars.driverId],
  }),
  assignments: many(carDriverAssignments),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  company: one(companies, {
    fields: [cars.companyId],
    references: [companies.id],
  }),
  driver: one(drivers, {
    fields: [cars.driverId],
    references: [drivers.id],
  }),
  driverAssignments: many(carDriverAssignments),
  telemetryHistory: many(carTelemetryHistory),
  mqttClient: one(mqttClients, {
    fields: [cars.id],
    references: [mqttClients.carId],
  }),
}));

export const mqttClientsRelations = relations(mqttClients, ({ one, many }) => ({
  car: one(cars, {
    fields: [mqttClients.carId],
    references: [cars.id],
  }),
  acls: many(mqttAcls),
}));

export const mqttAclsRelations = relations(mqttAcls, ({ one }) => ({
  client: one(mqttClients, {
    fields: [mqttAcls.clientId],
    references: [mqttClients.id],
  }),
}));

export const carDriverAssignmentsRelations = relations(
  carDriverAssignments,
  ({ one }) => ({
    car: one(cars, {
      fields: [carDriverAssignments.carId],
      references: [cars.id],
    }),
    driver: one(drivers, {
      fields: [carDriverAssignments.driverId],
      references: [drivers.id],
    }),
    company: one(companies, {
      fields: [carDriverAssignments.companyId],
      references: [companies.id],
    }),
    assignedByUser: one(users, {
      fields: [carDriverAssignments.assignedByUserId],
      references: [users.id],
    }),
  }),
);

export const carTelemetryHistoryRelations = relations(
  carTelemetryHistory,
  ({ one }) => ({
    car: one(cars, {
      fields: [carTelemetryHistory.carId],
      references: [cars.id],
    }),
    company: one(companies, {
      fields: [carTelemetryHistory.companyId],
      references: [companies.id],
    }),
  }),
);

export const notificationsRelations = relations(
  notifications,
  ({ one, many }) => ({
    createdByUser: one(users, {
      fields: [notifications.createdByUserId],
      references: [users.id],
    }),
    deliveries: many(notificationDeliveries),
  }),
);

export const notificationDeliveriesRelations = relations(
  notificationDeliveries,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationDeliveries.notificationId],
      references: [notifications.id],
    }),
    company: one(companies, {
      fields: [notificationDeliveries.companyId],
      references: [companies.id],
    }),
    companyUser: one(companyUsers, {
      fields: [notificationDeliveries.companyUserId],
      references: [companyUsers.id],
    }),
  }),
);

export const notificationPushSubscriptionsRelations = relations(
  notificationPushSubscriptions,
  ({ one }) => ({
    company: one(companies, {
      fields: [notificationPushSubscriptions.companyId],
      references: [companies.id],
    }),
    companyUser: one(companyUsers, {
      fields: [notificationPushSubscriptions.companyUserId],
      references: [companyUsers.id],
    }),
  }),
);

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
