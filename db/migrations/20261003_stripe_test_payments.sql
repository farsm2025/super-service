-- Apply only to an isolated Neon test branch. No calendar tables are changed.
BEGIN;
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY,
  appointment_id text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'truck_deposit' CHECK (kind = 'truck_deposit'),
  amount integer NOT NULL DEFAULT 10000 CHECK (amount = 10000),
  currency text NOT NULL DEFAULT 'chf' CHECK (currency = 'chf'),
  livemode boolean NOT NULL DEFAULT false CHECK (livemode = false),
  stripe_payment_intent_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','authorized','captured','released','expired')),
  captured_amount integer NOT NULL DEFAULT 0 CHECK (captured_amount BETWEEN 0 AND amount),
  capture_before timestamptz,
  link_expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  intent_started_at timestamptz,
  operation text CHECK (operation IN ('capture','release')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
COMMIT;
