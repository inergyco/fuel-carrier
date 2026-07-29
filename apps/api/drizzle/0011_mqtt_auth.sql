DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mqtt_acl_access') THEN
    CREATE TYPE "public"."mqtt_acl_access" AS ENUM('read', 'write', 'readwrite');
  END IF;
END
$migration$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mqtt_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(128) NOT NULL,
	"password_hash" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_superuser" boolean DEFAULT false NOT NULL,
	"car_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mqtt_clients_username_unique" UNIQUE("username"),
	CONSTRAINT "mqtt_clients_car_id_unique" UNIQUE("car_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mqtt_acls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"topic" varchar(256) NOT NULL,
	"access" "mqtt_acl_access" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mqtt_clients_car_id_cars_id_fk'
  ) THEN
    ALTER TABLE "mqtt_clients"
      ADD CONSTRAINT "mqtt_clients_car_id_cars_id_fk"
      FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mqtt_acls_client_id_mqtt_clients_id_fk'
  ) THEN
    ALTER TABLE "mqtt_acls"
      ADD CONSTRAINT "mqtt_acls_client_id_mqtt_clients_id_fk"
      FOREIGN KEY ("client_id") REFERENCES "public"."mqtt_clients"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mqtt_acls_client_id_idx" ON "mqtt_acls" USING btree ("client_id");--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "mqtt_clients" TO fuel_carrier_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "mqtt_acls" TO fuel_carrier_app;--> statement-breakpoint
-- Read-only role for Mosquitto (mosquitto-go-auth). Change password in production.
DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fuel_carrier_mqtt') THEN
    CREATE ROLE fuel_carrier_mqtt
      WITH LOGIN
      PASSWORD 'fuel_carrier_mqtt'
      NOINHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  ELSE
    ALTER ROLE fuel_carrier_mqtt WITH LOGIN NOBYPASSRLS;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
DECLARE
  db_name text := current_database();
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO fuel_carrier_mqtt', db_name);
END
$migration$;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO fuel_carrier_mqtt;--> statement-breakpoint
GRANT SELECT ON TABLE "mqtt_clients" TO fuel_carrier_mqtt;--> statement-breakpoint
GRANT SELECT ON TABLE "mqtt_acls" TO fuel_carrier_mqtt;
