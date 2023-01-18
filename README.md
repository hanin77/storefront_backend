# Storefront Backend Project

## Getting Started

1. add .env file that includes all env variables above:

```
    POSTGRES_HOST=127.0.0.1
    POSTGRES_PORT=5432
    POSTGRES_PORT_TEST=5432
    POSTGRES_DB=devdb_store_backend
    POSTGRES_TEST_DB=testdb_store_backend
    POSTGRES_USER=your_user
    POSTGRES_PASSWORD=your_user_password
    NODE_ENV=development
    BCRYPT_PASSWORD=your_secret_key
    SALT_ROUNDS=10
    TOKEN_SECRET=your_jwr_secret_key
```

2. `npm install` to install all dependencies
3. make sure that you created dev and test databases and follow the steps bellow:
4. `npm run migrate-db-up` to set up the database and get access
5. `npm run build` to build the server

6. `npm run start` to start the server and get access using the url: http://127.0.0.1:3000

## Test the server

1. make sure you created a test db referenced in the .env file POSTGRES_TEST_DB.

2. simply run the command `npm run test` to run all tests
