import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema';
import { mqttAcls } from '../database/schema/mqtt-acls';
import { mqttClients } from '../database/schema/mqtt-clients';
import { hashMqttSecret } from '../mqtt/mqtt-secret.utils';

/** Fixed local-dev defaults — override with MQTT_SEED_* env vars for production. */
const BACKEND_USERNAME = 'backend';
const DEVICE_USERNAME = 'device1';
const SIMULATOR_USERNAME = 'simulator';
const DEV_BACKEND_PASSWORD = 'dev-backend-secret';
const DEV_DEVICE_PASSWORD = 'dev-device-secret';
const DEV_SIMULATOR_PASSWORD = 'dev-simulator-secret';

type Db = NodePgDatabase<typeof schema>;

async function seedMqttClients(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const isProd = process.env.MQTT_SEED_PROD === 'true';
  const backendPassword =
    process.env.MQTT_SEED_BACKEND_PASSWORD ??
    (isProd ? undefined : DEV_BACKEND_PASSWORD);
  const seedDevice = isProd
    ? process.env.MQTT_SEED_DEVICE === 'true'
    : process.env.MQTT_SEED_DEVICE !== 'false';
  const devicePassword = process.env.MQTT_SEED_DEVICE_PASSWORD;

  if (!backendPassword) {
    throw new Error(
      'MQTT_SEED_BACKEND_PASSWORD is required when MQTT_SEED_PROD=true',
    );
  }

  if (isProd && backendPassword === DEV_BACKEND_PASSWORD) {
    throw new Error(
      'Refusing to seed production with the local-dev backend password',
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    await upsertClient({
      db,
      username: BACKEND_USERNAME,
      password: backendPassword,
      acls: [{ topic: 'telemetry/#', access: 'read' }],
    });

    console.log(
      isProd
        ? 'MQTT backend client seeded (production):'
        : 'MQTT clients seeded (local/dev):',
    );
    if (isProd) {
      console.log(
        `  ${BACKEND_USERNAME} → subscribe telemetry/# (password = MQTT_SEED_BACKEND_PASSWORD)`,
      );
      console.log(
        `  Set API MQTT_USERNAME=${BACKEND_USERNAME} and MQTT_PASSWORD to that same secret.`,
      );
    } else {
      console.log(
        `  ${BACKEND_USERNAME} / ${backendPassword}  → subscribe telemetry/#`,
      );
    }

    if (seedDevice) {
      const password = devicePassword ?? DEV_DEVICE_PASSWORD;
      await upsertClient({
        db,
        username: DEVICE_USERNAME,
        password,
        acls: [{ topic: `telemetry/${DEVICE_USERNAME}/#`, access: 'write' }],
      });
      console.log(
        `  ${DEVICE_USERNAME} / ${password}  → publish telemetry/${DEVICE_USERNAME}/#`,
      );
    }

    const seedSimulator = isProd
      ? process.env.MQTT_SEED_SIMULATOR === 'true'
      : process.env.MQTT_SEED_SIMULATOR !== 'false';
    if (seedSimulator) {
      const password = isProd
        ? process.env.MQTT_SEED_SIMULATOR_PASSWORD
        : (process.env.MQTT_SEED_SIMULATOR_PASSWORD ?? DEV_SIMULATOR_PASSWORD);
      if (!password) {
        throw new Error(
          'MQTT_SEED_SIMULATOR_PASSWORD is required when MQTT_SEED_SIMULATOR=true in production',
        );
      }
      if (isProd && password === DEV_SIMULATOR_PASSWORD) {
        throw new Error(
          'Refusing to seed production with the local-dev simulator password',
        );
      }
      await upsertClient({
        db,
        username: SIMULATOR_USERNAME,
        password,
        acls: [{ topic: 'telemetry/#', access: 'write' }],
      });
      console.log(
        `  ${SIMULATOR_USERNAME} / ${password}  → publish telemetry/# (local fleet sim)`,
      );
    }
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

seedMqttClients().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to seed MQTT clients: ${message}`);
  process.exit(1);
});
