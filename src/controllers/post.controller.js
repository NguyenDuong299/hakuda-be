const Post = require("../models/post.model");

const postController = {
  getAllPosts: (req, res) => {
    Post.getAllPost()
      .then((post) => res.json(post))
      .catch((err) => res.status(500).send(err));
  },

  createPost: (req, res) => {
    const { title, content, thumbnail, author, hot } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Tiêu đề không được để trống" });
    }
    const newPost = { title, content, thumbnail, author, hot };
    Post.createPost(newPost)
      .then((result) => res.status(201).json({ id: result.insertId, ...newPost }))
      .catch((err) => res.status(500).send(err));
  },
  getPostById: (req, res) => {
    const { id } = req.params;
    Post.getById(id)
      .then((post) => {
        res.json(post);
      })
      .catch((err) => {
        if (err.message === "Post not found") {
          return res.status(404).json({ message: "Không tìm thấy bài viết." });
        }
        res.status(500).json({ error: err.message });
      });
  },
  updatePost: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Post.updatePost(id, data)
      .then((result) => res.json({ message: "Tin tức đã được chỉnh sửa", post: data }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deletePost: (req, res) => {
    const { id } = req.params;

    Post.delete(id)
      .then(() => res.json({ message: "Tin tức được xoá" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = postController;
