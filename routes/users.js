import express from "express";

import { emailValidation } from "../middleware/errorHandling.js";
const router = express.Router();
import { signin, signup } from "../controllers/users.js";

router.post("/signin", emailValidation("signIn"), signin);
router.post("/signup", emailValidation("signUp"), signup);
export default router;
