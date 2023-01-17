# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

#### Products

- Index
- Show
- Create [token required]
- [OPTIONAL] Top 5 most popular products
- [OPTIONAL] Products by category (args: product category)

#### Users

GET http://localhost:3000/users
GET http://localhost:3000/users/:userid
POST http://localhost:3000/users
POST http://localhost:3000/users/login

#### Orders

- Current Order by user (args: user id)[token required]
- [OPTIONAL] Completed Orders by user (args: user id)[token required]

## Database schema

![DB Schema](./tt%20-%20public.png 'Optional title')

## Data Shapes

#### Product

- id SERIAL PK
- name VARCHAR(100)
- price REAL
- category VARCHAR(50)

#### User

- id SERIAL PK
- firstName VARCHAR(100)
- lastName VARCHAR(100)
- password VARCHAR(255)

#### Orders

- id SERIAL PK
- user_id INT FK
- status BOOLEAN (active or complete)

#### Order_products

- id SERIAL PK,
- quantity REAL,
- order_id INT FK,
- product_id INT FK,
