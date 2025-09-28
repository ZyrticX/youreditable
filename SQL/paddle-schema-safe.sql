-- Safe Paddle Integration Schema Update
-- This version checks for existing objects before creating them
-- Run this in your Supabase SQL Editor

-- Step 1: Add Paddle fields to profiles table (safe - uses IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    -- Add paddle_customer_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'paddle_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN paddle_customer_id TEXT;
    END IF;
    
    -- Add paddle_subscription_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'paddle_subscription_id') THEN
        ALTER TABLE public.profiles ADD COLUMN paddle_subscription_id TEXT;
    END IF;
    
    -- Add subscription_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;
    
    -- Add subscription_current_period_end if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_current_period_end') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 2: Create indexes for Paddle fields (safe - uses IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_profiles_paddle_customer_id ON public.profiles(paddle_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_paddle_subscription_id ON public.profiles(paddle_subscription_id);

-- Step 3: Create subscriptions table (safe - uses IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    paddle_subscription_id TEXT UNIQUE NOT NULL,
    paddle_customer_id TEXT NOT NULL,
    plan_id TEXT NOT NULL, -- 'basic', 'pro'
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Enable RLS on subscriptions table (safe - idempotent)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for subscriptions (safe - uses IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    -- Policy for viewing own subscriptions
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscriptions') THEN
        CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Policy for updating own subscriptions
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscriptions') THEN
        CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Step 6: Create indexes for subscriptions (safe - uses IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Step 7: Create or update the timestamp function (safe - uses CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create triggers safely
DO $$ 
BEGIN
    -- Trigger for subscriptions table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at 
            BEFORE UPDATE ON public.subscriptions 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Skip profiles trigger since it already exists
    -- IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    --     CREATE TRIGGER update_profiles_updated_at 
    --         BEFORE UPDATE ON public.profiles 
    --         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    -- END IF;
END $$;

-- Step 9: Verify the setup
DO $$ 
BEGIN
    RAISE NOTICE '✅ Paddle schema update completed successfully!';
    RAISE NOTICE '📊 Checking tables...';
    
    -- Check if profiles table has new columns
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'paddle_customer_id') THEN
        RAISE NOTICE '  ✅ profiles.paddle_customer_id exists';
    ELSE
        RAISE NOTICE '  ❌ profiles.paddle_customer_id missing';
    END IF;
    
    -- Check if subscriptions table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'subscriptions') THEN
        RAISE NOTICE '  ✅ subscriptions table exists';
    ELSE
        RAISE NOTICE '  ❌ subscriptions table missing';
    END IF;
    
    RAISE NOTICE '🎯 Ready for Paddle integration!';
END $$;
