CREATE TYPE transaction_type AS ENUM ('video_gen', 'image_gen', 'credit_purchase');
CREATE TYPE billing_type AS ENUM ('free', 'paid');

-- To add 'credit_purchase' to an existing transaction_type enum, run:
-- ALTER TYPE transaction_type ADD VALUE 'credit_purchase';
