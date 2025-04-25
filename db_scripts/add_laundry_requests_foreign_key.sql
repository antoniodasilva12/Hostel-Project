-- Add foreign key constraint to laundry_requests table
ALTER TABLE laundry_requests
ADD CONSTRAINT fk_student
FOREIGN KEY (student_id) 
REFERENCES profiles(id)
ON DELETE CASCADE; 