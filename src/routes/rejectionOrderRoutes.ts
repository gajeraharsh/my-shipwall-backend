import express from "express"; // Use ES module imports for consistency

import { getAllRejectionOrders } from "../controllers/orderRejectionController";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();


router.route("/").get(verifyJWT, getAllRejectionOrders);


export default router;
