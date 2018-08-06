# Pizza Delivery API by Leonardo BALLAND

> @leonardoballand on Twitter

**The objective of this project was to build an API from scratch without any dependency.**

- Manage user accounts
- Manage authentication and secure API requests with token authentication system
- Get a list of pizzas
- Manage user carts and orders
- Support email notifications

## **[Available routes]**

### [GENERIC]

##### Get API informations - **GET** /api

---

**Request**

```
GET /api HTTP/1.1
Host: localhost:3000
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {
        "name": "Pizza Delivery API",
        "version": "0.1.0",
        "author": "Leonardo BALLAND",
        "company": "Baleo IT",
        "protocolSupport": {
            "http": true,
            "https": true
        },
        "authProtect": "active"
    },
    "message": "API informations"
}
```

### [USERS]

##### Create a new user - **POST** /users

---

**Request**

```
POST /users HTTP/1.1
Host: localhost:3000
Cache-Control: no-cache

{
	"firstName": "Leonardo",
	"lastName": "BALLAND",
	"email": "balland.leonardo@baleo-it.com",
	"address": "14, Place Morgan 13300 Salon de Provence",
	"password": "baleoit2018"
}
```

**Response**

```
{
    "status": 201,
    "data": {
        "id": "balland.leonardo@baleo-it.com",
        "firstName": "Leonardo",
        "lastName": "BALLAND",
        "email": "balland.leonardo@baleo-it.com",
        "address": "14, Place Morgan 13300 Salon de Provence",
        "carts": [],
        "orders": [],
        "createdAt": 1533558246613,
        "updatedAt": 1533558246613
    },
    "message": "User has been created."
}
```

---

##### Get a specific user - **GET** /users?id=userId _[token protected]_

---

**Request**

```
GET /users?id=balland.leonardo@baleo-it.com HTTP/1.1
Host: localhost:3000
token: ho7rjevem61kpvi0wv5l
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "balland.leonardo@baleo-it.com",
        "firstName": "Leonardo",
        "lastName": "BALLAND",
        "email": "balland.leonardo@baleo-it.com",
        "address": "14, Place Morgan 13300 Salon de Provence",
        "carts": [],
        "orders": [],
        "createdAt": 1533558246613,
        "updatedAt": 1533558246613
    },
    "message": "User details has been found."
}
```

---

##### Update a specific user - **PUT** /users?id=userId _[token protected]_

---

**Request**

```
PUT /users?id=balland.leonardo@baleo-it.com HTTP/1.1
Host: localhost:3000
token: ho7rjevem61kpvi0wv5l
Cache-Control: no-cache

{
	"firstName": "Léo"
}
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "balland.leonardo@baleo-it.com",
        "firstName": "Léo",
        "lastName": "BALLAND",
        "email": "balland.leonardo@baleo-it.com",
        "address": "14, Place Morgan 13300 Salon de Provence",
        "password": "11e050f1e77378f74f81d86c0659c2cfb679ed41bda643052df2bf2fa740970b",
        "carts": [],
        "orders": [],
        "createdAt": 1533558246613,
        "updatedAt": 1533558976332
    },
    "message": "User updated."
}
```

---

##### Delete a specific user - **DELETE** /users?id=userId _[token protected]_

---

**Request**

```
DELETE /users?id=balland.leonardo@baleo-it.com HTTP/1.1
Host: localhost:3000
token: ho7rjevem61kpvi0wv5l
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {},
    "message": "User has been deleted."
}
```

### [AUTHENTICATION]

##### Log-in a user (will create a new accesstoken) - **POST** /auth/login

---

**Request**

```
POST /auth/login HTTP/1.1
Host: localhost:3000
Cache-Control: no-cache

{
 "email": "balland.leonardo@baleo-it.com",
 "password": "baleoit2018"
}
```

**Response**

```
{
    "status": 201,
    "data": {
        "id": "ho7rjevem61kpvi0wv5l",
        "expires": 1533565930709,
        "userId": "balland.leonardo@baleo-it.com"
    },
    "message": "Token has been created."
}
```

---

##### Log-out a user (will destroy accesstoken) - **GET** /auth/logout _[token protected]_

---

**Request**

```
GET /auth/logout HTTP/1.1
Host: localhost:3000
token: hf8baezovbbtoebejpoc
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {},
    "message": "Token is now invalid."
}
```

---

##### Extends a valid accesstoken - **GET** /auth/refreshtoken _[token protected]_

---

**Request**

```
GET /auth/refreshtoken?id=balland.leonardo@baleo-it.com HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "7f23krtths4pda7c8fy8",
        "expires": 1533568911479,
        "userId": "balland.leonardo@baleo-it.com"
    },
    "message": "Token has been extended."
}
```

---

### [MENU]

##### Get all menu items - **GET** /menu

---

**Request**

```
GET /menu HTTP/1.1
Host: localhost:3000
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": [
        {
            "id": 1,
            "name": "Royale",
            "description": "The most original italian pizza than ever!",
            "ingredients": [
                "cheese",
                "tomato",
                "bacon",
                "apes"
            ],
            "price": 920
        },
        {
            "id": 0,
            "name": "Margarita",
            "description": "The original italian pizza!",
            "ingredients": [
                "cheese",
                "tomato",
                "bacon"
            ],
            "price": 850
        }
    ],
    "message": "List contains 2 menu items."
}
```

---

### [CART SYSTEM]

##### Create a new cart - **POST** /cart _[token protected]_

---

**Request**

```
POST /cart HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache

{
 "userId": "balland.leonardo@baleo-it.com",
 "items": [0]
}
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "2gnh24ozmv",
        "userId": "balland.leonardo@baleo-it.com",
        "createdAt": 1533562794365,
        "updatedAt": 1533562794365,
        "items": [
            0
        ],
        "total": 850
    },
    "message": "Cart has been created."
}
```

---

##### Get a specific cart - **GET** /cart?id=cartId _[token protected]_

---

**Request**

```
GET /cart?id=2gnh24ozmv HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "2gnh24ozmv",
        "userId": "balland.leonardo@baleo-it.com",
        "createdAt": 1533562794365,
        "updatedAt": 1533562794365,
        "items": [
            {
                "id": 0,
                "name": "Margarita",
                "description": "The original italian pizza!",
                "ingredients": [
                    "cheese",
                    "tomato",
                    "bacon"
                ],
                "price": 850
            }
        ],
        "total": 850
    },
    "message": "Cart contains 1 items."
}
```

---

##### Update a specific cart - **PUT** /cart?id=cartId _[token protected]_

---

**Request**

```
PUT /cart?id=2gnh24ozmv HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache

{
 "items": [1]
}
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "2gnh24ozmv",
        "userId": "balland.leonardo@baleo-it.com",
        "createdAt": 1533562794365,
        "updatedAt": 1533563104801,
        "items": [
            0,
            1
        ],
        "total": 1770
    },
    "message": "Cart has been updated."
}
```

---

##### Delete a specific cart - **DELETE** /cart?id=cartId _[token protected]_

---

**Request**

```
DELETE /cart?id=2gnh24ozmv HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache
```

**Response**

```
{
    "status": 200,
    "data": {},
    "message": "Cart has been deleted."
}
```

### [ORDER WITH PAYMENT AND EMAIL NOTIFICATION SYSTEM]

##### Order a specific cart content - **POST** /order _[token protected]_

---

**Request**

```
POST /order HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache

{
 "cartId": "lajdr8lb0b"
}
```

**Response**

```
{
    "status": 200,
    "data": {
        "id": "ch_1Cw98jIPhQAsTU1kBGeQ5SBh",
        "amount": 850,
        "created": 1533563573,
        "currency": "eur",
        "description": "Charge for balland.leonardo@baleo-it.com",
        "paid": true,
        "status": "succeeded",
        "userId": "balland.leonardo@baleo-it.com"
    },
    "message": "Order has been authorized and an email confirmation has been sent."
}
```

## **[ACCESS TOKEN]**

When you log-in with an existing user account, the server response contains a valid accesstoken.
Use a `token` key in the request headers of each protected request :

```
GET /users?id=balland.leonardo@baleo-it.com HTTP/1.1
Host: localhost:3000
token: 7f23krtths4pda7c8fy8
Cache-Control: no-cache
```

## **[How to use]**

1.  Generate the required SSL certificates (See [How-To](https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs)) and place the `cert.pem` and `key.pem` files in the `config/` directory.
2.  Rename the `config/config.sample.js` file into `config/index.js` and fill it with your Stripe and Mailgun API informations [Stripe](https://stripe.com) [Mailgun](https://www.mailgun.com/)
3.  Run the HTTP and HTTPS servers [SSL troubleshooting in local environment](https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec)

```
node index.js
```

4.  Create a new user
5.  Log in with the account you've just created to get your accesstoken
6.  Get the menu items list
7.  Create a new cart with some items
8.  Create a new order

You're done!

### **[TODO]**

- ~~Update user account when a new cart was created~~
- ~~Update user account when a cart is deleted~~
- ~~Update user account when a new order was created~~
- ~~Remove any user data (orders, carts, token) when a user account was deleted~~
- Populate cart items when updating a cart
- Populate orders and carts when requesting the user account
- Replace user email as id with a random id
- Improve the request handling system to use prettier url (eg: /users/userId)
- Add a new route to change dynamically the API configuration
