CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY  KEY,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255));