-- Add status column to room_allocations table
ALTER TABLE room_allocations 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add constraint to ensure status is one of the allowed values
ALTER TABLE room_allocations
ADD CONSTRAINT room_allocations_status_check 
CHECK (status IN ('active', 'inactive', 'terminated')); 