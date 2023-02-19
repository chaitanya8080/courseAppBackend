import jwt from "jsonwebtoken";

import { User } from "../models/UserModel.js";

import * as dotenv from "dotenv";

dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ message: "you are not authorised, logged in first" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

  req.user = await User.findById(decoded._id);

  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: `${req.user.role} is not allowed to access this resource`});
  }

  next();
};

export const authorizeSubscribers = (req, res, next) => {

  if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
    return res.status(403).json({ message: `${req.user.role} is not allowed to access this lecture`});
  }

  next();
};
