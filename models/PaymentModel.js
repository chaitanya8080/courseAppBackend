


import {mongoose}  from "mongoose";


const paymentSchema = new mongoose.Schema({
    
       subscriptionId:{
        type:String
       },
      createdAt:{
        type:Date,
        default:Date.now()
      }
});

export const PaymentModel = mongoose.model("Payment", paymentSchema);
