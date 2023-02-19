
import  express  from "express";
import { buySubscription, cancelSubscription, paymentVerification } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";



const router = express.Router();

// buy subscription

router.route("/subscribe").get(isAuthenticated, buySubscription)

router.route("/paymentverification").get(isAuthenticated, paymentVerification);

router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription);

export default router;