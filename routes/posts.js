import express from "express";
const router = express.Router();
import {
  getPosts,
  getPost,
  getPostsBySearch,
  createPost,
  updatePost,
  deletePost,
  likeCount,
  commentPost,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";
import { productValidations } from "../middleware/errorHandling.js";

router.get("/", getPosts);
router.get("/search", getPostsBySearch);
router.get("/getPost/:id", getPost);
router.post("/", auth, productValidations(), createPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/likeCount", auth, likeCount);
router.post("/:id/comment", auth, commentPost);

export default router;
