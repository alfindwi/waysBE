import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import router from "./src/router";

dotenv.config();
const app = express();
const server = createServer(app);
app.use(cors());
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);


server.listen(port, () => console.log("Server is running on port 3000"));
