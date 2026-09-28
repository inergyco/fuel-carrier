-- Resolve duplicate live mobiles before enforcing uniqueness.
--> statement-breakpoint
WITH ranked AS (
	SELECT
		id,
		row_number() OVER (
			PARTITION BY mobile_number
			ORDER BY created_at ASC, id ASC
		) AS rn
	FROM drivers
	WHERE deleted_at IS NULL
		AND mobile_number <> ''
)
UPDATE drivers AS d
SET mobile_number = left(d.mobile_number, 14) || '-d' || ranked.rn::text
FROM ranked
WHERE d.id = ranked.id
	AND ranked.rn > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_mobile_number_unique" ON "drivers" USING btree ("mobile_number") WHERE "drivers"."deleted_at" IS NULL AND "drivers"."mobile_number" <> '';
