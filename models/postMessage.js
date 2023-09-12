import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    name: String,
    creator: {
      type: String,
      required: true,
    },
    comments: { type: [String], default: [] },
    selectedFile: String,
    tags: [String],
    likes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const PostMessage = mongoose.model("Posts", postSchema);
export default PostMessage;
