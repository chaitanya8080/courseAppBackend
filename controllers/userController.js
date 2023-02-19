import { User } from "../models/UserModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { sendToken } from "../utils/sendToken.js";
import { CourseModel } from "../models/CourseModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { StatsModel } from "../models/StatsModel.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password || !file) {
      return res.status(400).json({ message: "please add all fields" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already exist" });
    }

    // upload on cloudinary

    const fileUri = getDataUri(file);

    const mycloude = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloude.public_id,
        url: mycloude.secure_url,
      },
    });

    sendToken(res, user, "Register Successfully", 201);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "please add all fields" });
    }
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Incorrect Email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Email or password" });
    }

    sendToken(res, user, `Welcome back ${user.name}`, 201);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

//logout User
export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "please add all fields" });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "incorrect Old Password" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated Sussessfully",
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

export const updateprofilepicture = async (req, res, next) => {
  try {
    const file = req.file;

    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);

    const mycloude = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
      public_id: mycloude.public_id,
      url: mycloude.secure_url,
    };

    await user.save();

    res.status(200).json({ success: true, message: "profilePic updated" });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `click on the link to reset your password, ${url}`;

    await sendEmail(user.email, "courseBundler Reset Password", message);

    res
      .status(200)
      .json({ success: true, message: `reset token is sent to user ${email}` });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "token is invalid or has been expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "password reset succesfully" });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

export const addToPlaylist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const course = await CourseModel.findById(req.body.id);

    if (!course) {
      return res.status(404).json({ message: "invalid course ID" });
    }
    const itemExist = user.playlist.find(
      (item) => course._id.toString() == item.course.toString()
    );

    if (itemExist) {
      return res.status(409).json({ message: "Item already exist" });
    }

    user.playlist.push({
      course: course._id,
      poster: course.poster.url,
    });

    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromPlaylist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const course = await CourseModel.findById(req.query.id);

    if (!course) {
      return res.status(404).json({ message: "invalid course ID" });
    }

    const newPlayList = user.playlist.filter(
      (item) => item.course.toString() !== course._id.toString()
    );

    user.playlist = newPlayList;

    await user.save();

    res
      .status(200)
      .json({ message: "this course deleted from playlist", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  admin controller

export const getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find({});

    res.status(200).json({ message: "all users", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    if (user.role === "user") {
      user.role = "admin";
    } else {
      user.role = "user";
    }

    await user.save();

    res.status(200).json({ message: "User Role Updated Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    res.status(200).json({ message: "User deleted Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ message: "User deleted Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

User.watch().on("change", async () => {
  const stats = await StatsModel.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].users = await User.countDocuments();

  stats[0].subscription = subscription.length;

  stats[0].createdAt = new Date(Date.now());

  await stats[0].save()
});
