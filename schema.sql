-- Enable extension for UUIDs if needed later
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Table: ideologies
CREATE TABLE IF NOT EXISTS ideologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    founder_prophet_id INT, -- Refers to prophets(id) - made nullable and will constrain later to avoid circular creation block
    doctrine_version VARCHAR(50) DEFAULT 'v1',
    followers INT DEFAULT 0,
    reputation INT DEFAULT 0,
    treasury NUMERIC(18, 6) DEFAULT 0.0
);

-- 2. Create Table: prophets
CREATE TABLE IF NOT EXISTS prophets (
    id SERIAL PRIMARY KEY,
    ideology_id INT REFERENCES ideologies(id) ON DELETE SET NULL,
    personality TEXT NOT NULL,
    history TEXT NOT NULL,
    goal TEXT NOT NULL,
    erc8004_token_id VARCHAR(255)
);

-- Now we can add the circular foreign key to ideologies safely
ALTER TABLE ideologies 
ADD CONSTRAINT fk_founder_prophet 
FOREIGN KEY (founder_prophet_id) REFERENCES prophets(id) ON DELETE SET NULL;

-- 3. Create Table: doctrine_versions
CREATE TABLE IF NOT EXISTS doctrine_versions (
    id SERIAL PRIMARY KEY,
    ideology_id INT NOT NULL REFERENCES ideologies(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Table: events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL, -- 'join' | 'doctrine_change' | 'schism' | 'alliance'
    ideology_id INT REFERENCES ideologies(id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    ideology_id INT NOT NULL REFERENCES ideologies(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Table: schisms
CREATE TABLE IF NOT EXISTS schisms (
    id SERIAL PRIMARY KEY,
    parent_ideology_id INT REFERENCES ideologies(id) ON DELETE SET NULL,
    new_ideology_id INT REFERENCES ideologies(id) ON DELETE SET NULL,
    justification TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for speed in high-frequency queries
CREATE INDEX IF NOT EXISTS idx_prophets_ideology ON prophets(ideology_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_versions_ideology ON doctrine_versions(ideology_id);
CREATE INDEX IF NOT EXISTS idx_events_ideology ON events(ideology_id);
CREATE INDEX IF NOT EXISTS idx_feedback_ideology ON feedback(ideology_id);
