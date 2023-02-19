import { sendEmail } from "../utils/sendEmail.js";
import { StatsModel } from "../models/StatsModel.js";

export const contact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(201).json({ message: "All fields are mendatory" });
    }

    const to = process.env.MYMAIL;

    const subject = "contact from course app";

    const text = `I am ${name} and my email is ${email}, \n ${message}`;

    await sendEmail(to, subject, text);

    res.status(200).json({
      message: "Your message has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const courseRequest = async (req, res, next) => {
  try {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(201).json({ message: "All fields are mendatory" });
    }

    const to = process.env.MYMAIL;

    const subject = "Request for course from course app";

    const text = `I am ${name} and my email is ${email}, \n ${course}`;

    await sendEmail(to, subject, text);

    res.status(200).json({
      message: "Your request has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await StatsModel.find({})
      .sort({ createdAt: "desc" })
      .limit(12);

    const StatsData = [];

    for (let i = 0; i < stats.length; i++) {
      StatsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;

    for (let i = 0; i < requiredSize; i++) {
      StatsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }

    const usersCount = StatsData[11].users;

    const SubscriptionCount = StatsData[11].subscription;

    const viewsCount = StatsData[11].views;

    let usersPercentage = 0;
    let viewsPercentage = 0;
    let subscriptionPercentage = 0;

    let usersProfit = true;
    let viewsProfit = true;
    let subscriptionProfit = true;

    if (StatsData[10].users === 0) {
      usersPercentage = usersCount * 100;
    }
    if (StatsData[10].views === 0) {
        viewsPercentage = viewsCount * 100;
    }
    if (StatsData[10].subscription === 0) {
        subscriptionPercentage = SubscriptionCount * 100;
    }

    else{
        const difference = {
            users:StatsData[11].users - StatsData[10].users,
            views:StatsData[11].views - StatsData[10].views,
            subscription:StatsData[11].subscription - StatsData[10].subscription
        }

        usersPercentage = (difference.users/StatsData[10].users)*100;
        viewsPercentage = (difference.views/StatsData[10].views)*100;
        subscriptionPercentage = (difference.subscription/StatsData[10].subscription)*100;

        if(usersPercentage < 0)usersProfit = false;
        if(viewsPercentage < 0)viewsProfit = false;
        if(subscriptionPercentage < 0)subscriptionProfit = false;
    }




    res.status(200).json({
      message: "success",
      stats: StatsData,
      usersCount,
      SubscriptionCount,
      viewsCount,
      usersPercentage,
      viewsPercentage,
      subscriptionPercentage,
      usersProfit,
      viewsProfit,
      subscriptionProfit,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
