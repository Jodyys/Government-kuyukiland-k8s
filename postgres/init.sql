CREATE TABLE citizens (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO citizens (nik, first_name, last_name, email, phone, password)
VALUES 
('1234567890123456', 'Budi', 'Santoso', 'budi@mail.com', '08123456789', 'password123');