UPDATE app_users
SET role = 'ADMINISTRADOR'
WHERE role = 'ADMIN';

UPDATE app_users
SET role = 'MOTORISTA'
WHERE role = 'DRIVER';

ALTER TABLE app_users
DROP CONSTRAINT IF EXISTS app_users_role_check;

ALTER TABLE app_users
ADD CONSTRAINT app_users_role_check
CHECK (role IN ('ADMINISTRADOR', 'MOTORISTA'));
