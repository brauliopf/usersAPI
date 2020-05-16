// General configurations
import express from "express";
const server = express();
const dotenv = require("dotenv").config({ path: "./config/config.env" });
import colors from "colors";
import connectDB from "./config/db"

// Load middlewares
import { loadDefaultMiddlewares } from "./middlewares";
loadDefaultMiddlewares(server);

// Configure routes
import * as routes from "./routes";
server.use('/api/v1/users/:id/messages', routes.messageRouter);
server.use("/api/v1/chats", routes.chatRouter);
server.use("/api/v1/users", routes.userRouter);
server.use("/api/v1/coaches/:id/sessions", routes.sessionRouter);
server.use("/api/v1/coaches", routes.coachRouter);
server.use('/api/v1/sessions/:id/messages', routes.messageRouter);
server.use("/api/v1/sessions/:id/orders", routes.orderRouter);
server.use("/api/v1/orders", routes.orderRouter);
server.use("/api/v1/sessions", routes.sessionRouter);
server.use("/api/v1/messages", routes.messageRouter);
server.use("/api/v1/stripe", routes.stripeRouter);

// Set up the error handler middleware
// A thrown error or passed to next will be handled here
import { errorHandler } from "./middlewares/errorHandler";
server.use(errorHandler);

// Run server
connectDB();
const port = process.env.PORT || 5000;
server.set("env", process.env.NODE_ENV);
server.listen(port, () => console.log(`Server running in ${server.get("env")} mode on port ${port}`.red.bold));