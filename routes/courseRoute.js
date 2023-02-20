
import  express  from "express";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import { authorizeAdmin, isAuthenticated,authorizeSubscribers } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";


const router = express.Router();

// Get all courses without lectures
router.route('/courses').get(getAllCourses);
// create new course
router.route('/createcourses').post(isAuthenticated, authorizeAdmin, singleUpload,createCourse);

// add lecture , delete course, get Course Details

router.route("/course/:id").get(isAuthenticated,authorizeSubscribers,getCourseLectures)
.post(isAuthenticated,authorizeAdmin,singleUpload,addLecture)
.delete(isAuthenticated,authorizeAdmin,deleteCourse )


router.route("/lecture").delete(isAuthenticated,authorizeAdmin,deleteLecture)

//delet Lecture
// router.route("")

export default router;