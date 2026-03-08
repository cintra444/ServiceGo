ALTER TABLE app_users
    ADD COLUMN plan_type VARCHAR(20) NOT NULL DEFAULT 'PRO',
    ADD COLUMN subscription_status VARCHAR(20) NOT NULL DEFAULT 'TRIAL',
    ADD COLUMN subscription_source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE;

UPDATE app_users
SET trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '30 days')
WHERE subscription_status = 'TRIAL' AND trial_ends_at IS NULL;
