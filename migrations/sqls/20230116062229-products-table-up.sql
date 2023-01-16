CREATE TABLE IF NOT EXISTS products(id SERIAL PRIMARY  KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price real);