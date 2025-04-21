const Post = require("../models/post.model");

const postController = {
  getAllPosts: (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    Post.getTotalPosts(search)
      .then((totalPosts) => {
        Post.getAllPost(limit, offset, search)
          .then((posts) => {
            res.json({ page, totalPosts, posts });
          })
          .catch((err) => res.status(500).send(err));
      })
      .catch((err) => res.status(500).send(err));
  },

  getAllPostsHot: (req, res) => {
    Post.getAllPostHot()
      .then((posts) => {
        res.json({ posts });
      })
      .catch((err) => res.status(500).send(err));
  },

  createPost: (req, res) => {
    const { title, content, thumbnail, author, hot } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Tiêu đề không được để trống" });
    }
    const newPost = { title, content, thumbnail, author, hot };
    Post.createPost(newPost)
      .then((result) => res.status(201).json({ id: result.insertId, ...newPost, message: "Thêm bài viết thành công!" }))
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
      .then((result) => res.json({ message: "Bài viết đã được chỉnh sửa", post: data }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deletePost: (req, res) => {
    const { id } = req.params;

    Post.deletePost(id)
      .then(() => res.json({ message: "Bài viết đã được xoá!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = postController;
