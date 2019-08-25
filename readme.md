# Setup
- Run `npm install`.
- Run `node index.js`.

# Technical Approach
## Server Setup
### Summary
I use Express and Apollo Server to set up the API server with all data stored simply in memory. A better approach would have been to use an actual database, and I would have liked to explore separating the GraphQL server from the actual API server.

### Pros
- Fast setup.

### Cons
- Data does not persist.
- Structures less extensible and scalable.

## Authentication
### Summary
I store username/passwords in plaintext and return a trivially signed JWT-esque token for accessing the current user's data.

### Pros
- Fast setup.
- Slightly faster runtime.

### Cons
- Data is not secure (we don't use individualized salts for each user or even hash the passwords at all)
- Token signing is easy to reverse-engineer.
- Token never expires.

## Messages
### Summary
We write to the data directly when creating messages. Retrieve using GraphQL.

### Pros
- Straightforward implementation
- Demonstrates ability to learn GraphQL basics

### Cons
- Very basic functionality (no advanced querying, metadata, etc).

# API Endpoints
## POST /register
Create a user using a username and password.
Example request body:
```
{
  "username": "billnye@science.com",
  "password": "sciencerocks",
}
```

201 if successful
## POST /login
Login using a valid username and password combination.
Example request body:
```
{
  "username": "billnye@science.com",
  "password": "sciencerocks",
}
```

Returns an un-urlencoded, never-expiring token trivially signed. This token will be used to make valid requests around messages.
## POST /messages
Create a message for the current user. With bad credentials, request is rejected.
Example request body:
```
{
  "message": "Making another science documentary!",
  "token": "billnye@science.com/billnye@science.com123",
}
```

200 if successful
## GET /messages
Get all messages given a valid token for an existing user.
Example request body:
```
{
  "token": "billnye@science.com/billnye@science.com123",
}
```

Example response body:
```
{
  "data":{
    "messages":[
      "Making another science documentary!",
      "Science is really cool!"
    ]
  }
}
```

