-- Apply only to the isolated Stripe test branch.
CREATE TABLE IF NOT EXISTS carton_orders (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE,
  quantities jsonb NOT NULL,
  amount integer NOT NULL CHECK (amount > 0 AND amount <= 116820),
  currency text NOT NULL DEFAULT 'chf' CHECK (currency = 'chf'),
  livemode boolean NOT NULL DEFAULT false CHECK (livemode = false),
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','expired')),
  customer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(quantities) = 'object'),
  CHECK ((quantities->>'standard')::integer BETWEEN 0 AND 99),
  CHECK ((quantities->>'grand')::integer BETWEEN 0 AND 99),
  CHECK (amount = (quantities->>'standard')::integer * 490 + (quantities->>'grand')::integer * 690)
);
CREATE INDEX IF NOT EXISTS carton_orders_created_at_idx ON carton_orders (created_at DESC);
