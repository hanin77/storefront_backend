CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    status BOOLEAN DEFAULT TRUE,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id));