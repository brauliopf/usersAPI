import helmet from "helmet";
import cors from "cors"; // conforme to HTTPS rules
import express from "express";
import hpp from "hpp"; // Present http polution
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit" // Limit the rate of requests to the API
import log from './log';
import { identify } from './auth'


export const loadDefaultMiddlewares = server => {
  server.use(identify);
  server.use(cors());
  server.use(helmet());
  server.use(express.json());
  server.use(hpp());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 200 }));
  server.use(log.logger);
}