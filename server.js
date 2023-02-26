import app from "./app.js";

import { connection } from "./config/database.js";

import cloudinary from "cloudinary";

import nodeCron from "node-cron";
import {StatsModel} from "./models/StatsModel.js"



cloudinary.v2.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_SECRET_KEY
})

// full start = second , if one "0"  and increasing
nodeCron.schedule('0 0 * * *', async()=>{
    try {
      await StatsModel.create({})
    } catch (error) {
      console.log(error)
    }
})

// const temp = async()=>{
//   await  StatsModel.create({})
// }
// temp()

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log(`server is working on port: ${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});
