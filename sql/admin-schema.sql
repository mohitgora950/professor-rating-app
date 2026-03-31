-- ============================================================
--  TABLE: admin_email_logs  (Track all emails sent)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_email_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  professor_id INT,
  recipient_email VARCHAR(180),
  subject      VARCHAR(255),
  sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status       ENUM('success','failed','pending') DEFAULT 'pending',
  error_msg    TEXT,
  FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE SET NULL
);

-- ============================================================
--  CREATE ADMIN USER
-- ============================================================
-- First, add admin role to users table if not exists
-- ALTER TABLE users MODIFY COLUMN role ENUM('student','professor','admin') DEFAULT 'student';

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@iiitmanipul.ac.in',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7Ec0MpHScQQS2K/cxWXvgmIi',  -- bcrypt hash of 'admin123'
  'admin',
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE email=email;

-- ============================================================
--  VIEW: teacher_performance_summary
-- ============================================================
CREATE OR REPLACE VIEW teacher_performance_summary AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.dept,
  p.subject,
  COUNT(r.id) as total_ratings,
  AVG(r.stars) as average_rating,
  SUM(CASE WHEN r.stars = 5 THEN 1 ELSE 0 END) as excellent_count,
  SUM(CASE WHEN r.stars = 4 THEN 1 ELSE 0 END) as good_count,
  SUM(CASE WHEN r.stars = 3 THEN 1 ELSE 0 END) as average_count,
  SUM(CASE WHEN r.stars <= 2 THEN 1 ELSE 0 END) as poor_count,
  COUNT(d.id) as doubts_answered,
  MAX(r.created_at) as last_rated
FROM professors p
LEFT JOIN ratings r ON p.id = r.professor_id
LEFT JOIN doubts d ON p.id = d.professor_id AND d.answered_at IS NOT NULL
GROUP BY p.id;
