const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var request = require('request');
const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = gql`
  type Query {
    messages(username: String!): [String]
    password(username: String!): String
  }
`;
const resolvers = {
  Query: {
    messages: (parent, args) => messages[args.username],
    password: (parent, args) => passwords[args.username],
  },
};
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app }); // app is from an existing express app

app.use(bodyParser.urlencoded({ extended: true }));

// Serve all files inside the `dist` directory.
app.use(express.json());

app.post('/register', (req, res) => {
  // need both username and password
  if (!req.body.username || !req.body.password) {
    res.status(400).send(JSON.stringify({
      reason: 'missing parameter',
    }));
  // need to make sure username doesn't already exist
  } else if (passwords.hasOwnProperty(req.body.username)) {
    res.status(409).send(JSON.stringify({
      reason: 'user already exists',
    }));
  // otherwise create
  } else if (passwords.hasOwnProperty(req.body.username)) {
    passwords[req.body.username] = req.body.password;
    messages[req.body.username] = [];
    res.status(201).send(JSON.stringify());
  }
});

app.post('/login', (req, res) => {
  // need both username and password
  if (!req.body.username || !req.body.password) {
    res.status(401).send(JSON.stringify({
      reason: 'missing username/password',
    }));
  // need to make sure username doesn't already exist
  } else if (passwords.hasOwnProperty(req.body.username) && passwords[req.body.username] !== req.body.password) {
    res.status(401).send(JSON.stringify({
      reason: 'incorrect username/password',
    }));
  // otherwise login
  } else if (passwords.hasOwnProperty(req.body.username) && passwords[req.body.username] === req.body.password) {
    res.status(200).send(JSON.stringify({
      token: req.body.username + '/' + req.body.username + '123', // the fakest jw
    }));
  }
});

const validateLogin = (token) => {
  const [username, signedUsername] = token.split('/');
  return username + '123' === signedUsername;
}

const extractUsername = (token) => {
  const [username, signedUsername] = token.split('/');
  return username;
}

app.post('/messages', (req, res) => {
  const token = req.body.token;
  // need both username and password
  if (!validateLogin(token)) {
    res.status(401).send(JSON.stringify({
      reason: 'invalid credentials',
    }));
  } else if (!req.body.message) {
    res.status(400).send(JSON.stringify({
      reason: 'missing message',
    })); 
  } else {
    const username = extractUsername(token);
    messages[username].push(req.body.message);

    res.status(200).send();
  }
});

app.get('/messages', (req, res) => {
  const token = req.body.token;
  // need both username and password
  if (!validateLogin(token)) {
    res.status(401).send(JSON.stringify({
      reason: 'invalid credentials',
    }));
  } else {
    const username = extractUsername(token);
    
    request.post({
      url: `http://localhost:8000${server.graphqlPath}`,
      body: JSON.stringify({
        query: `{
          messages(username: "bill@microsoft.com")
        }`,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    }, function (error, response, body) {
      if (!error && res.statusCode == 200) {
        res.status(200).send(body);
      } else {
        res.status(response.statusCode).send(response.body);
      }
    });
  }
});

app.listen(8000, (...foo) => {
  console.log(`GraphQL Endpoint: http://localhost:8000${server.graphqlPath}`)
});

// basic authentication
// for prod, use real database, store hashed passwords with salts, use server pepper
const passwords = { // user(key) => password(value)
  'bill@microsoft.com': 'melindarocks',
}

const messages = {
  'bill@microsoft.com': [
    'Big announcment around Windows 95 launch today!',
    'Huge announcment around Windows 2000 launch today!',
    'Gigantic announcment around Windows Vista launch today!',
    'Tremendous announcment around Windows 7 launch today!',
  ],
}