import express from "express";

import { config } from "dotenv";

import Course from "./routes/courseRoute.js";
import User from "./routes/userRoutes.js";
import cookiesParser from "cookie-parser";
import Payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();
//routes
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookiesParser());

app.use(cors({
   origin:process.env.FRONTEND_URL,
   credentials:true,
   methods:["GET","POST","PUT","DELETE"],
}))

app.use("/api/v1", Course);
app.use("/api/v1", User);
app.use("/api/v1", Payment);
app.use("/api/v1", other);

export default app;

app.use("/", (req, res) =>
  res.send(
    `<h1>site is working <a href=${process.env.FRONTEND_URL}>Click here</a> to visit frontend</h1>`
  )
);
