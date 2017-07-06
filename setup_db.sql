DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  gender VARCHAR(45) NOT NULL,
  byear VARCHAR(45) NOT NULL
);

DROP TABLE IF EXISTS member_details;
CREATE TABLE member_details (
  id INT,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discipline VARCHAR(45) NOT NULL,
  owns_equipment TINYINT NOT NULL,
  draw_weight INT,
  draw_length INT,
  equipment_description TEXT,
  distance INT,
  joad_day varchar(45)
);

DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  date DATE NOT NULL,
  id INT NOT NULL,
  is_joad_practice TINYINT NOT NULL default 1
);

DROP TABLE IF EXISTS reschedules;
CREATE TABLE reschedules (
  id INT NOT NULL,
  from_date DATE,
  to_date DATE,
  note TEXT
);


DROP TABLE IF EXISTS form_notes;
CREATE TABLE form_notes (
  id INT,
  date DATE NOT NULL,
  category VARCHAR(45) NOT NULL,
  status VARCHAR(45) NOT NULL,
  note TEXT,
  instructor VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
  date DATE NOT NULL,
  id INT NOT NULL,
  distance INT NOT NULL,
  target_size VARCHAR(45) NOT NULL,
  is_tournament TINYINT NOT NULL,
  number_rounds INT NOT NULL,
  arrows_per_round INT NOT NULL,
  score TEXT NOT NULL,
  total_score INT NOT NULL,
  arrow_average DECIMAL(7,6) NOT NULL,
  note TEXT
);

