// Importing necessary modules
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { configurePassport } from "./passport/passport.config.js";

import { buildContext } from "graphql-passport";

// Importing merged resolvers and type definitions
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

// Importing function to connect to the data base
import { connectDB } from "./db/connectDB.js";

// Load environment variables from a `.env` file into `process.env`
dotenv.config();

configurePassport();

// Create an Express application
const app = express();

// Create an HTTP server instance
const httpServer = http.createServer(app);

// Initializes the connect-mongo library, which is used to store session data in MongoDB.
const MongoDBStore = connectMongo(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI, // MongoDB connection string
  collection: "sessions", // Collection to store sessions
});

// Handle errors
store.on("error", (error) => {
  console.error("Session store error:", error);
});

// Configures sessions in the Express app.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // Session lasts 7 days (in milliseconds)
      httpOnly: true, // this option prevents the Cross-Site Scripting (XSS) attacks
    },
    store: store, // Uses the MongoDB store defined earlier
  })
);

// Passport Integration
app.use(passport.initialize());
app.use(passport.session());

// Initialize the ApolloServer instance
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start the Apollo server
await server.start();

// Set up the GraphQL endpoint with middleware
app.use(
  "/",
  cors({
    origin: "http://localhost:3000", // our react app
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// Start the HTTP server and listen on port 4000
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

// Log a message indicating the server is ready
console.log(`🚀 Server ready at http://localhost:4000/`);
