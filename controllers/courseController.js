
import { CourseModel } from "../models/CourseModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { StatsModel } from "../models/StatsModel.js";


// export const getAllCourses = async (req, res, next) => {
  

//   const keyword = req.query.keyword || "";
//   const category = req.query.category ||"";

//   const courses = await CourseModel.find({
//     title:{
//       $regex : keyword,
//       $options:"i"
//     },
//     category:{
//       $regex : category,
//       $options:"i"
//     }
//   }).select('-lectures');

//   res.status(200).json({ success: true, courses });
// };

export const getAllCourses = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category ||"";

    const courses = await CourseModel.find({
      title:{
        $regex : keyword,
        $options:"i"
      },
      category:{
        $regex : category,
        $options:"i"
      }
    }).select('-lectures');

    res.status(200).json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({message:error.message});
  }
}









export const createCourse = async (req, res) => {


  const { title, description, category, createdBy } = req.body;

  try {

    if (!title || !description || !category || !createdBy){
      return res.status(400).json({message:"please add all fields"});
    }
  
    const file = req.file;

    const fileUri = getDataUri(file);

    const  mycloude = await cloudinary.v2.uploader.upload(fileUri.content);
    // console.log(fileUri.content);
    
    const newCourse = new CourseModel({
      title:title,
      description:description,
      category:category,
      createdBy,
      poster: {
        public_id: mycloude.public_id,
        url: mycloude.secure_url,
      },
    });
  
  const course = await CourseModel.create(newCourse);
 res.status(201).json({ success: true, message: "course created" ,course});
    
  } catch (error) {
    return res.status(500).json({message:error.message});
  }
    
};







export const getCourseLectures = (async (req, res, next) => {
  
  try {
    const course = await CourseModel.findById(req.params.id)
    if(!course){
      return res.status(404).json({message:"course not found"});
    }

    course.views +=1;

    await course.save();

    res.status(200).json({ success: true, lectures:course.lectures });

  } catch (error) {
     res.status(500).json({message:error.message});
  }

});

export const addLecture = (async (req, res, next) => {
  
  try {
      const {title, description} = req.body;
      const {id} = req.params;

      // const file = req.file;

    const course = await CourseModel.findById(id);

    console.log({course:course});

    if(!course){
      return res.status(404).json({message:"course not found"});
    }

    const file = req.file;

    const fileUri = getDataUri(file);

    const  mycloude = await cloudinary.uploader.upload(fileUri.content,
      {resource_type : "image"},
);


    course.lectures.push({
       title,
       description,
       video:{
        public_id:mycloude.public_id,
        url:mycloude.secure_url,
       }
    })


    course.noOfVideos = course.lectures.length;

    await course.save();
  
   
    res.status(200).json({ success: true,message:"lectures added in course"});

  } catch (error) {
     res.status(500).json({message:error.message});
  }

});


export const deleteCourse = async (req, res) => {

  try {
    const { id } = req.params;
   const course = await CourseModel.findById(id);
  
  if(!course){
    return res.status(404).json({message:"course not found"});
  }

  await cloudinary.v2.uploader.destroy(course.poster.public_id)


  for(let i =0; i<course.lectures.length ; i++){

      const singleLecture = course.lectures[i];
      await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
        resource_type:"image",
      })
  }
   await course.remove();


 res.status(200).json({ success: true, message: "this course deleted successfully" ,course});
    
  } catch (error) {
    return res.status(500).json({message:error.message});
  }
    
};


export const deleteLecture = async (req, res) => {

  try {
    const { courseId, lectureId } = req.query;

   const course = await CourseModel.findById(courseId);
  
  if(!course){
    return res.status(404).json({message:"course not found"});
  }


const  lecture = course.lectures.find((item)=>item._id.toString() === lectureId.toString());


await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
  resource_type:"image",
})

  
  course.lectures = course.lectures.filter((item)=>item._id.toString() !== lectureId.toString() )

  
  course.noOfVideos = course.lectures.length;

  await course.save();

 res.status(200).json({ success: true, message: "this lecture deleted successfully" ,course});
    
  } catch (error) {
    return res.status(500).json({message:error.message});
  }
    
};


CourseModel.watch().on("change",async ()=>{
  const stats = await StatsModel.find({}).sort({ createdAt: "desc" }).limit(1);

  const courses = await CourseModel.find({})

  let totalViews = 0;


  for(let i =0; i < courses.length;  i++){
     totalViews += courses[i].views
  }

  stats[0].views = totalViews;

  stats[0].createdAt = new Date(Date.now())

  await stats[0].save()

})










  