// Importing necessary modules
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

// Importing merged resolvers and type definitions
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

// Importing function to connect to the data base
import { connectDB } from "./db/connectDB.js";

// Load environment variables from a `.env` file into `process.env`
dotenv.config();

// Create an Express application
const app = express();

// Create an HTTP server instance
const httpServer = http.createServer(app);

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
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  })
);

// Start the HTTP server and listen on port 4000
await new Promise((resolve) => httpServer.listen({ port: 4001 }, resolve));
await connectDB();

// Log a message indicating the server is ready
console.log(`🚀 Server ready at http://localhost:4001/`);
