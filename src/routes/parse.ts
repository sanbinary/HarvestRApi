import express, { Request, Response } from "express";
import multer from "multer";
import { parse } from "../controllers/parseController.js";
const router = express.Router();

router.get("/", function (req: Request, res: Response, next) {
  res.send("respond with a resource update");
});

router.post("/", multer().none(), parse);

export default router;
