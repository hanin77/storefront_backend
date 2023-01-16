 CREATE TABLE IF NOT EXISTS order_products(
    id SERIAL PRIMARY KEY,
    quantity real,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id));