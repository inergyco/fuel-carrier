import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { BCRYPT_ROUNDS } from '../auth/password.utils';
import * as schema from '../database/schema';
import { mqttAcls } from '../database/schema/mqtt-acls';
import { mqttClients } from '../database/schema/mqtt-clients';

/** Fixed local-dev credentials — not for production. */
const BACKEND_USERNAME = 'backend';
const BACKEND_PASSWORD = 'dev-backend-secret';
const DEVICE_USERNAME = 'device1';
const DEVICE_PASSWORD = 'dev-device-secret';

type Db = NodePgDatabase<typeof schema>;

async function seedMqttClients(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    await upsertClient({
      db,
      username: BACKEND_USERNAME,
      password: BACKEND_PASSWORD,
      acls: [{ topic: 'telemetry/#', access: 'read' }],
    });

    await upsertClient({
      db,
      username: DEVICE_USERNAME,
      password: DEVICE_PASSWORD,
      acls: [{ topic: `telemetry/${DEVICE_USERNAME}/#`, access: 'write' }],
    });

    console.log('MQTT clients seeded (local/dev only):');
    console.log(
      `  ${BACKEND_USERNAME} / ${BACKEND_PASSWORD}  → subscribe telemetry/#`,
    );
    console.log(
      `  ${DEVICE_USERNAME} / ${DEVICE_PASSWORD}  → publish telemetry/${DEVICE_USERNAME}/#`,
    );
  } finally {
    await pool.end();
  }
}

async function upsertClient(params: {
  db: Db;
  username: string;
  password: string;
  isSuperuser?: boolean;
  acls: Array<{ topic: string; access: 'read' | 'write' | 'readwrite' }>;
}): Promise<void> {
  const passwordHash = await hashMqttSecret(params.password);

  await params.db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: mqttClients.id })
      .from(mqttClients)
      .where(eq(mqttClients.username, params.username))
      .limit(1);

    let clientId = existing?.id;

    if (clientId) {
      await tx
        .update(mqttClients)
        .set({
          passwordHash,
          enabled: true,
          isSuperuser: params.isSuperuser ?? false,
        })
        .where(eq(mqttClients.id, clientId));
      await tx.delete(mqttAcls).where(eq(mqttAcls.clientId, clientId));
    } else {
      const [created] = await tx
        .insert(mqttClients)
        .values({
          username: params.username,
          passwordHash,
          enabled: true,
          isSuperuser: params.isSuperuser ?? false,
          carId: null,
        })
        .returning({ id: mqttClients.id });
      clientId = created.id;
    }

    await tx.insert(mqttAcls).values(
      params.acls.map((acl) => ({
        clientId,
        topic: acl.topic,
        access: acl.access,
      })),
    );
  });
}

async function hashMqttSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

seedMqttClients().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to seed MQTT clients: ${message}`);
  process.exit(1);
});
