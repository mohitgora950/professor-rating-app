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
('Dr. Akoijam Malemnganbi','HBS','English Language Teaching','akoijam@iiitmanipur.ac.in','+91 98765 10001','https://www.iiitmanipur.ac.in/img/staff/Malemnganbi.jpeg','Translation Studies, Human Language Technology, Entrepreneurial Communications','["PhD from University of Hyderabad, India","Assistant Professor HBS","Expert in Translation Studies & Human Language Technology"]'),
('Dr. Anup Dey','ECE','Nanoelectronic Devices','anupece@iiitmanipur.ac.in','+91 98765 10002','https://api.dicebear.com/7.x/lorelei/svg?seed=AnupDey','Nanoelectronic devices, ISFET, Gas Sensing, QDs, Biosensors, Graphene, Solar cells','["Post-Doc University of Manitoba, Canada","PhD Jadavpur University","Assistant Professor ECE"]'),
('Dr. Dilip Singh','ECE','VLSI Design & FPGA','dilip@iiitmanipur.ac.in','+91 98765 10003','https://api.dicebear.com/7.x/lorelei/svg?seed=DilipSingh','Hardware acceleration, VLSI design, Speech coding, FPGA-based system design','["Post doc IIT Madras","PhD NIT Hamirpur","Assistant Professor ECE"]'),
('Dr. Enukonda Venkata Pothan','ECE','Wireless Communication','pothan@iiitmanipur.ac.in','+91 98765 10004','https://api.dicebear.com/7.x/lorelei/svg?seed=Pothan','Wireless networks, cell-free massive MIMO, spectrum sharing, UAV communication','["PhD IIT Guwahati","Assistant Professor ECE","Specialist in massive MIMO systems"]'),
('Dr. Jennil Thiyam','CSE','Machine Learning & AI','jennil@iiitmanipur.ac.in','+91 98765 10005','https://api.dicebear.com/7.x/lorelei/svg?seed=JennilThiyam','Computer vision, OCR, NLP, Representation learning, Deep learning, ML','["Post doc ISS Academia Sinica Taiwan","PhD IIT Guwahati","Assistant Professor CSE"]'),
('Dr. Kamalesh Kumar','HBS','Computational Mathematics','kamalesh@iiitmanipur.ac.in','+91 98765 10006','https://api.dicebear.com/7.x/lorelei/svg?seed=KamaleshKumar','Numerical Analysis, Singularly Perturbed Differential Equations, Computational Mathematics','["PhD Visvesvaraya NIT Nagpur","Assistant Professor HBS"]'),
('Dr. Khoirom Motilal Singh','CSE','Information Security','motilal@iiitmanipur.ac.in','+91 98765 10007','https://api.dicebear.com/7.x/lorelei/svg?seed=MotilalSingh','Information Security, Cryptanalysis and Cryptography','["PhD NIT Nagaland","Assistant Professor CSE"]'),
('Prof. Krishnan Baskar','ECE','Semiconductor Devices','director@iiitmanipur.ac.in','+91 98765 10008','https://api.dicebear.com/7.x/lorelei/svg?seed=KrishnanBaskar','Semiconductor Material and Devices','["D.Sc. KTH Sweden","Post-Doc Nagoya Institute Japan","Post-Doc KTH Stockholm","PhD Anna University","Director IIIT Manipur"]'),
('Dr. Nagesh Ch','ECE','VLSI & MEMS','nagesh@iiitmanipur.ac.in','+91 98765 10009','https://api.dicebear.com/7.x/lorelei/svg?seed=NageshCh','VLSI, MEMS & SAW Devices for Biomedical Applications','["PhD IIT Guwahati","Assistant Professor ECE"]'),
('Dr. Navanath Saharia','CSE','Natural Language Processing','nsaharia@iiitmanipur.ac.in','+91 98765 10010','https://api.dicebear.com/7.x/lorelei/svg?seed=NavanathSaharia','Social Networks Content Analysis, Natural Language Processing','["PhD Tezpur University","Assistant Professor CSE"]'),
('Dr. Ngasepam Monica Devi','ECE','Thin Films & Photodetectors','monica@iiitmanipur.ac.in','+91 98765 10011','https://api.dicebear.com/7.x/lorelei/svg?seed=MonicaDevi','Device fabrication of thin films & 1D structures, photodetectors & solar cells','["PhD NIT Nagaland","Assistant Professor ECE"]'),
('Dr. D. Neelamegam','ECE','Hyperspectral Imaging','neelamegam@iiitmanipur.ac.in','+91 98765 10012','https://api.dicebear.com/7.x/lorelei/svg?seed=Neelamegam','Non-Destructive Sensing, Hyperspectral Imaging, Drone Technology','["PhD Pondicherry University","Assistant Professor ECE"]'),
('Dr. Nongmeikapam Kishorjit Singh','CSE','AI & Machine Learning','kishorjit@iiitmanipur.ac.in','+91 98765 10013','https://api.dicebear.com/7.x/lorelei/svg?seed=KishorjitSingh','NLP, Image Processing, Soft Computing, AI & Machine Learning','["PhD Jadavpur University","Assistant Professor CSE"]'),
('Dr. Pradipkanti Devi Lairenjam','HBS','Condensed Matter Physics','pradipkanti@iiitmanipur.ac.in','+91 98765 10014','https://api.dicebear.com/7.x/lorelei/svg?seed=PradipkantiDevi','Soft Condensed Matter Physics','["Post-Doc Freiburg Germany","Post-Doc JNCASR Bengaluru","PhD IIT Madras","Assistant Professor HBS"]'),
('Dr. Partha Kumar Deb','ECE','RF & Microwave Circuits','parthadeb.ece@iiitmanipur.ac.in','+91 98765 10015','https://api.dicebear.com/7.x/lorelei/svg?seed=ParthaDeb','RF & Microwave circuits, Microstrip Patch Antenna, EBG PBG FSS, Meta-materials','["PhD NIT Agartala","Assistant Professor ECE"]'),
('Dr. Prabhat Singh','ECE','Semiconductor Device Physics','prabhat@iiitmanipur.ac.in','+91 98765 10016','https://api.dicebear.com/7.x/lorelei/svg?seed=PrabhatSingh','Semiconductor device physics, solid-state devices, analog CMOS','["Post doc IIT Bhubaneswar","PhD NIT Hamirpur","Assistant Professor ECE"]'),
('Dr. Rajkumari Bidyalakshmi Devi','CSE','Image & Video Processing','rajkumari@iiitmanipur.ac.in','+91 98765 10017','https://api.dicebear.com/7.x/lorelei/svg?seed=RajkumariDevi','Image and Video processing, Deep learning','["PhD NIT Manipur","Assistant Professor CSE"]'),
('Dr. Ramesh Ch. Mishra','ECE','Wireless & MIMO Communications','ramesh@iiitmanipur.ac.in','+91 98765 10018','https://api.dicebear.com/7.x/lorelei/svg?seed=RameshMishra','Wireless Communications, MIMO Systems, Signal Processing','["PhD IIT Guwahati","Assistant Professor ECE"]');

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
