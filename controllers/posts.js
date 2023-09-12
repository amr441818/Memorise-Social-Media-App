import PostMessage from "../models/postMessage.js";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
import {
  validationErrors,
  expectedErrorHandling,
  serverSideErrorHandling,
} from "../middleware/errorHandling.js";
export const getPosts = async (req, res) => {
  const { page } = req.query;
  const LIMIT = 8;
  const skip = (page - 1) * LIMIT;

  try {
    const numberOfPosts = await PostMessage.countDocuments();

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(skip);
    // console.log(postMessages);
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(numberOfPosts / LIMIT),
    });
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
export const getPost = async (req, res) => {
  const { id: _id } = req.params;
  try {
    const post = await PostMessage.findById(_id);
    if (!post) {
      expectedErrorHandling("No post with this id!", 404);
    }
    // console.log(post);
    res.status(200).json(post);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;

  try {
    const title = new RegExp(searchQuery, "i");

    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });
    res.status(200).json({ data: posts });
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
export const createPost = async (req, res, next) => {
  validationErrors(req, next);
  const post = req.body;
  const { tags } = req.body;

  const sTags = tags.split(",");

  try {
    if (!req.file) {
      expectedErrorHandling("there is no image!", 404);
    }
    const imageUrl = req.file.path.replace("\\", "/");
    const newPost = new PostMessage({
      ...post,
      creator: req.userId,
      selectedFile: imageUrl,
      tags: sTags,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};

export const updatePost = async (req, res, next) => {
  const { id: _id } = req.params;
  const { title, message, tags, image } = req.body;

  let updatedImageUrl = image;
  if (req.file) {
    updatedImageUrl = req.file.path.replace("\\", "/");
  }
  try {
    const updatedPost = await PostMessage.findById(_id);
    if (!updatedPost) {
      expectedErrorHandling("post not found", 404);
    }
    if (updatedPost.selectedFile !== updatedImageUrl) {
      clearImage(updatedPost.selectedFile);
    }

    updatedPost.title = title;
    updatedPost.message = message;

    updatedPost.tags = tags;
    updatedPost.selectedFile = updatedImageUrl;
    const result = await updatedPost.save();

    res.json(result);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};

export const deletePost = async (req, res, next) => {
  const { id: _id } = req.params;

  try {
    const post = await PostMessage.findById(_id);
    if (!post) {
      expectedErrorHandling("post does not exist");
    }
    clearImage(post.selectedFile);

    const result = await PostMessage.findByIdAndRemove(_id);
    res.json(result);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

export const likeCount = async (req, res) => {
  const { id: _id } = req.params;
  try {
    const post = await PostMessage.findById(_id);
    if (!post) {
      expectedErrorHandling("post does not exist!", 404);
    }

    const likeIndex = post.likes.findIndex((id) => id === String(req.userId));

    if (likeIndex == -1) {
      //like the post
      post.likes.push(req.userId);
    } else {
      //dislike the post
      post.likes = post.likes.filter((postId) => postId !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });
    res.json(updatedPost);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};

export const commentPost = async (req, res) => {
  const { id: _id } = req.params;
  const { value } = req.body;

  try {
    const post = await PostMessage.findById(_id);
    if (!post) {
      expectedErrorHandling("post does not exist", 404);
    }
    post.comments.push(value);
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });

    res.json(updatedPost);
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
