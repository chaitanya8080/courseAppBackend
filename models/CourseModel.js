import {mongoose}  from "mongoose";


const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "please enter course title"],
    minLength: [4, "Title must be at least 4 charcter"],
    maxLength: [40, "Title cant exceed 40 character"],
  },
  description: {
    type: String,
    required: [true, "please enter course title"],
    minLength: [15, "Title must be at least 15"],
  },

  lectures: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],

  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  views: {
    type: Number,
    default: 0,
  },
  noOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, 'Enter Course creator name'],
  },
  createdAt: {
    type: Date,
    default:Date.now,
  },
});

export const CourseModel = mongoose.model("Course", CourseSchema);
