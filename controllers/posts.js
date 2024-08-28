const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment")

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user, isIndexPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      // Find posts and populate the comments field
      const posts = await Post.find()
        .sort({ createdAt: "desc" })
        .populate({
          path: 'comments', // Assuming you add the 'comments' field in the Post schema
          populate: {
            path: 'user', // Populate the 'user' field inside 'comments'
            select: 'userName' // Only fetch the 'userName' field
          }
        })
        .lean();

      res.render("feed.ejs", { posts: posts, isIndexPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({ post: post }).populate('user', 'userName');
      res.render("post.ejs", { post: post, user: req.user, comment: comments, isIndexPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  createComment: async (req, res) => {
    try {
  
      await Comment.create({
        comment: req.body.comment,
        post: req.params.id,
        user: req.user.id
      });
  
      console.log("Comment has been added!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.error('Error creating comment:', err);
      res.status(500).send('Failed to create comment');
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {transformation: [ 
        { aspect_ratio: '1:1', crop: 'fill' }
      ]
    });

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
