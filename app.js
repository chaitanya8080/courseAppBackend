

import express from 'express';

 import {config} from 'dotenv';

 import Course from './routes/courseRoute.js';
 import User from './routes/userRoutes.js'
 import cookiesParser from "cookie-parser";
import Payment from "./routes/paymentRoutes.js"
import other from "./routes/otherRoutes.js"


 config({
    path:'./config/config.env',
 })

const app = express();
//routes
app.use(express.json())
app.use(express.urlencoded({
   extended:true
}))
app.use(cookiesParser());


app.use("/api/v1",Course)
app.use("/api/v1",User)
app.use("/api/v1", Payment)
app.use("/api/v1", other)



export default app;

