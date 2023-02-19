import { User } from "../models/UserModel.js";
import { v4 as uuidv4 } from "uuid";
import { PaymentModel } from "../models/PaymentModel.js";
export const buySubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "admin") {
      return res.status(400).json({ message: "admin cant buy subscription" });
    }

    user.subscription.id = uuidv4();

    user.subscription.status = "active";

    await user.save();

    res
      .status(201)
      .json({
        message: "success",
        subscriptionId: user.subscription.id,
        status: user.subscription.status,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const paymentVerification = async (req, res, next) => {
  try {
    const { subscriptionId } = req.body;

    const user = await User.findById(req.user._id);

    if (subscriptionId != user.subscription.id) {
      return res.status(404).json({ message: "not valid user" });
    }

    await PaymentModel.create({
      subscriptionId: user.subscription.id,
    });

    res.status(201).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const subscriptionId = user.subscription.id;

    const payment = await PaymentModel.findOne({ subscriptionId });

    const gap = Date.now() - payment.createdAt;

    const refundtime = 7 * 24 * 60 * 60 * 1000;
    if (gap > refundtime) {
      return res.status(201).json({ message: "Can't cancel subsription." });
    }

    await payment.remove();

    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save();

    res
      .status(201)
      .json({
        message:
          "subscription cancel success,You will receive refund within 7 days",
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
