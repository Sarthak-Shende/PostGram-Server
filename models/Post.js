import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title:{
      type:String,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    image:{
      type:String,
      requried:true,
    },

  },
  {timestamps:true}
)

export default mongoose.model('Post',PostSchema);