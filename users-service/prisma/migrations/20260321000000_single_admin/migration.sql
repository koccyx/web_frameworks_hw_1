UPDATE "User"
SET "role" = 'user'
WHERE "role" = 'admin'
  AND "email" <> 'admin';

CREATE UNIQUE INDEX IF NOT EXISTS "User_single_admin_role_key"
ON "User" ("role")
WHERE "role" = 'admin';
