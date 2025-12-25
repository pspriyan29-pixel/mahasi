-- Add missing prizes field to competitions table
-- This migration adds backward compatibility for the frontend

ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS prizes TEXT;
