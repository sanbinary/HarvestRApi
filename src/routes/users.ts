import express, { Request, Response } from "express";
const router = express.Router();

/* GET users listing. */
router.get("/", function (req: Request, res: Response, next) {
  res.send("respond with a resource update");
});

export default router;
