
import  express  from "express";
import { contact, courseRequest, getDashboardStats } from "../controllers/otherController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// buy subscription

router.route("/contact").post(isAuthenticated, contact);

router.route("/courserequest").post(isAuthenticated, courseRequest);

router.route("/admin/stats").get(isAuthenticated,authorizeAdmin, getDashboardStats);


export default router;