# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

#### Products

1. Index
   GET http://localhost:3000/products

   - **_response body_**: multiple products found
     ```
        {
          "status": "success",
          "data": [
            {
              "id": 6,
              "name": "p1",
              "category": "CAT1",
              "price": 10
            },
            {
              "id": 7,
              "name": "p2",
              "category": "CAT2",
              "price": 100
            }
          ]
        }
     ```
   - **_response body_**: no products found
     ```
         {
           "status": "success",
           "data": []
         }
     ```

2. Show
   GET http://localhost:3000/products/:product_id
   - **_response body_**: product not found
     ```
       {
       "status": "fail",
       "message": "product with id: 555 not found"
       }
     ```
   - **_response body_**: product found
     ```
       {
         "status": "success",
         "data": {
           "id": 6,
           "name": "p1",
           "category": "CAT1",
           "price": 10
         }
       }
     ```
3. Create
   **name, price are required fields**.
   POST http://localhost:3000/products (**token rquired**)

   - **_response body_**: successful request

     ```
        {
          "status": "success",
          "data": {
            "id": 9,
            "name": "p1",
            "category": "toy",
            "price": 12
          }
        }
     ```

   - **_response body_**: failed request

     ```
         {
           "status": "fail",
           "message": "not all required fields where provided"
         }
     ```

4. [OPTIONAL] Top 5 most popular products
5. [OPTIONAL] Products by category (args: product category)
   GET http://localhost:3000/products?category=CAT1

   - **_response body_**: multiple products found

     ```
       {
         "status": "success",
         "data": [
           {
             "id": 6,
             "name": "p1",
             "category": "CAT1",
             "price": 10
           },
           {
             "id": 8,
             "name": "p3",
             "category": "CAT1",
             "price": 200
           }
         ]
       }
     ```

#### Users

1.  index
    GET http://localhost:3000/users (**token rquired**)
    - **_response body_**: multiple users found
      ```
        {
        "status": "success",
        "data": [
            {
                "id": 7,
                "username": "mohan0",
                "firstname": "mo0",
                "lastname": "han0"
            },
            {
                "id": 9,
                "username": "mohan2",
                "firstname": "mo2",
                "lastname": "han2"
            }
        ]
        }
      ```
    - **_response body_**: no users found
      ```
        {
            "status": "success",
            "data": []
        }
      ```
2.  show
    GET http://localhost:3000/users/:userid (**token rquired**)
    - **_response body_**: user not found
      ```
        {
            status: 'fail',
            message: `user with id: userid not found`
        }
      ```
    - **_response body_**: user found
      ```
        {
            "status": "success",
            "data": {
                "id": 7,
                "username": "mohan0",
                "firstname": "mo0",
                "lastname": "han0"
            }
        }
      ```
    - **_response body_**: missing token
      ```
        {
            "status": "fail",
            "message": "invalid token, log in and try again"
        }
      ```
3.  create
    **username, password, firstname and lastname are required fields**
    POST http://localhost:3000/users

    - **_response body_**: successful request

      ```
        {
            "status": "success",
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuMyIsImlhdCI6MTY3Mzk5NTMyN30.wdeVrzKPvviIev9N67qtQ5CpWY050OlRWiUXmstLLj8"
            }
        }
      ```

    - **_response body_**: missing username

      ```
        {
            "status": "fail",
            "message": "not all required fields where provided"
        }
      ```

4.  login
    **username, password are required fields**
    POST http://localhost:3000/users/login
    - **_response body_**: successful login
      ```
        {
            "status": "success",
            "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImlhdCI6MTY3Mzk5NjU5MH0. EuLUB4Gtjie0tkX34LfI1SwgQInaRYa-wsz66oQA3Yg"
            }
        }
      ```
    - **_response body_**: failed login weong password
      ```
        {
            "status": "fail",
            "message": "username or password is incorrect!"
        }
      ```

#### Orders

1. Current Order by user (args: user id)[token required]
   GET http://localhost:3000/orders/users/:user-id (**token rquired**)

   - **_response body_**: user has no active order

     ```
       {
         "status": "fail",
         "message": "user with id: 3 has no current active order"
       }
     ```

     - **_response body_**: user has an active order

       ```
        {
            "status": "success",
            "data": {
              "id": 6,
              "status": true,
              "user_id": "1",
              "products": [
                {
                  "id": 6,
                  "name": "p1",
                  "price": 10,
                  "quantity": 200
                }
              ]
            }
          }
       ```

     ```

     ```

2. [OPTIONAL] Completed Orders by user (args: user id)[token required]

## Database schema

![DB Schema](./tt%20-%20public.png 'Optional title')

## Data Shapes

#### Product

- id SERIAL PK NOT NULL
- name VARCHAR(100) NOT NULL
- price REAL NOT NULL
- category VARCHAR(50)

#### User

- id SERIAL PK NOT NULL
- username VARCHAR(100) UNIQUE NOT NULL
- firstName VARCHAR(100) NOT NULL
- lastName VARCHAR(100) NOT NULL
- password VARCHAR(255) NOT NULL

#### Orders

- id SERIAL PK NOT NULL
- user_id INT FK NOT NULL
- status BOOLEAN (active or complete)

#### Order_products

- id SERIAL PK NOT NULL
- quantity REAL NOT NULL
- order_id INT FK NOT NULL
- product_id INT FK NOT NULL
