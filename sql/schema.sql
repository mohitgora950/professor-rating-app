-- ============================================================
--  Professor Rating App — Complete Database Schema
--  File: sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS professor_rating_app;
USE professor_rating_app;

-- ─────────────────────────────────────────────
--  TABLE: users  (students & professors)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)        NOT NULL,
  email        VARCHAR(180)        UNIQUE NOT NULL,
  password     VARCHAR(255)        NOT NULL,   -- bcrypt hashed
  role         ENUM('student','professor','admin') DEFAULT 'student',
  roll_no      VARCHAR(30),                    -- for students
  prof_id      INT,                            -- links to professors.id if role=professor
  created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
--  TABLE: professors
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professors (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150)        NOT NULL,
  dept         ENUM('CSE','ECE','HBS') NOT NULL,
  subject      VARCHAR(200),
  email        VARCHAR(180),
  phone        VARCHAR(20),
  linkedin     VARCHAR(255),
  instagram    VARCHAR(255),
  facebook     VARCHAR(255),
  image_url    VARCHAR(500),
  interests    TEXT,
  achievements TEXT,               -- JSON array stored as text
  created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
--  TABLE: ratings
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  professor_id INT NOT NULL,
  stars        TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  feedback     TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)   REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (professor_id) REFERENCES professors(id)  ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  TABLE: doubts  (max 2 per student per day)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doubts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  professor_id INT,                -- optional: directed to specific prof
  question     TEXT NOT NULL,
  answer       TEXT,
  answered_by  INT,                -- professor user id who answered
  answered_at  TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)   REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (professor_id) REFERENCES professors(id)  ON DELETE SET NULL,
  FOREIGN KEY (answered_by)  REFERENCES users(id)       ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
--  TABLE: gifts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gifts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  from_user    INT NOT NULL,
  to_professor INT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user)    REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (to_professor) REFERENCES professors(id)  ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  TABLE: sessions  (simple token auth)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  token        VARCHAR(255) UNIQUE NOT NULL,
  expires_at   TIMESTAMP NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  SEED: Insert all 18 professors
-- ─────────────────────────────────────────────
INSERT INTO professors (name, dept, subject, email, phone, image_url, interests, achievements) VALUES
('A','CSE','Subject 1','a1@gmail.com','+91 9000000001','', 'AI, ML, Data Science','["PhD IIT Delhi","Expert in AI","Published papers"]'),

('B','ECE','Subject 2','b2@gmail.com','+91 9000000002','', 'Signal Processing, Embedded Systems','["PhD IIT Bombay","Research in VLSI","Assistant Professor"]'),

('C','ECE','Subject 3','c3@gmail.com','+91 9000000003','', 'VLSI, FPGA','["PhD NIT","Hardware expert","Published journals"]'),

('D','ECE','Subject 4','d4@gmail.com','+91 9000000004','', 'Wireless Communication','["PhD IIT Guwahati","MIMO specialist","Research projects"]'),

('E','CSE','Subject 5','e5@gmail.com','+91 9000000005','', 'Machine Learning, NLP','["PhD IIT Madras","Deep Learning expert","AI Research"]'),

('F','HBS','Subject 6','f6@gmail.com','+91 9000000006','', 'Mathematics, Modeling','["PhD NIT","Math expert","Teaching excellence"]'),

('G','CSE','Subject 7','g7@gmail.com','+91 9000000007','', 'Cyber Security','["PhD IIIT","Security expert","Cryptography research"]'),

('H','ECE','Subject 8','h8@gmail.com','+91 9000000008','', 'Semiconductors','["PhD Abroad","Device expert","Director level"]'),

('I','ECE','Subject 9','i9@gmail.com','+91 9000000009','', 'MEMS, VLSI','["PhD IIT","MEMS research","Professor"]'),

('J','CSE','Subject 10','j10@gmail.com','+91 9000000010','', 'NLP','["PhD University","NLP expert","Social data research"]'),

('K','ECE','Subject 11','k11@gmail.com','+91 9000000011','', 'Photodetectors','["PhD NIT","Solar research","Thin films"]'),

('L','ECE','Subject 12','l12@gmail.com','+91 9000000012','', 'Drone Tech','["PhD University","Imaging expert","Drone research"]'),

('M','CSE','Subject 13','m13@gmail.com','+91 9000000013','', 'AI, ML','["PhD Jadavpur","AI expert","Soft computing"]'),

('N','HBS','Subject 14','n14@gmail.com','+91 9000000014','', 'Physics','["PhD IIT","Condensed matter","Research scholar"]'),

('O','ECE','Subject 15','o15@gmail.com','+91 9000000015','', 'RF Circuits','["PhD NIT","Antenna expert","Meta-materials"]'),

('P','ECE','Subject 16','p16@gmail.com','+91 9000000016','', 'Semiconductor Physics','["PhD IIT","CMOS expert","Device physics"]'),

('Q','CSE','Subject 17','q17@gmail.com','+91 9000000017','', 'Image Processing','["PhD NIT","Video processing","Deep learning"]'),

('R','ECE','Subject 18','r18@gmail.com','+91 9000000018','', 'Wireless Communication','["PhD IIT","MIMO expert","Signal processing"]'),

('S','CSE','Subject 19','s19@gmail.com','+91 9000000019','', 'Deep Learning','["PhD IIT","Generative AI","NLP expert"]');
-- ─────────────────────────────────────────────
--  USEFUL VIEWS
-- ─────────────────────────────────────────────

-- Professor average ratings view
CREATE OR REPLACE VIEW professor_ratings AS
SELECT
  p.id,
  p.name,
  p.dept,
  p.subject,
  p.image_url,
  COALESCE(ROUND(AVG(r.stars), 1), 0) AS avg_rating,
  COUNT(r.id) AS total_ratings
FROM professors p
LEFT JOIN ratings r ON r.professor_id = p.id
GROUP BY p.id
ORDER BY avg_rating DESC;

-- Top 10 professors
CREATE OR REPLACE VIEW top10_professors AS
SELECT * FROM professor_ratings LIMIT 10;

-- Daily doubt count per student
CREATE OR REPLACE VIEW student_daily_doubts AS
SELECT
  student_id,
  DATE(created_at) AS doubt_date,
  COUNT(*) AS doubt_count
FROM doubts
WHERE DATE(created_at) = CURDATE()
GROUP BY student_id, DATE(created_at);
