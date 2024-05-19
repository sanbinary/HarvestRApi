import express from "express";
import path from "path";
import url from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import { default as indexRouter } from "./routes/index.js";
import { default as parseRouter } from "./routes/parse.js";

const app = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/parse", parseRouter);

export default app;
