const Post = require('../models/Post');

// Get all posts (with optional category, search keyword, and pagination)
const getPosts = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { eligibility: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving posts' });
  }
};

// Get single post details
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving post details' });
  }
};

// Create a new post (Admin protected)
const createPost = async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create post. Check inputs.', details: error.message });
  }
};

// Update an existing post (Admin protected)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update post.', details: error.message });
  }
};

// Delete a post (Admin protected)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting post' });
  }
};

// Get simple analytics dashboard statistics (Admin protected)
const getStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const categories = ['Job', 'Result', 'Admit Card', 'Exam Date', 'Admission', 'Answer Key'];
    const categoryCounts = {};

    for (const cat of categories) {
      categoryCounts[cat] = await Post.countDocuments({ category: cat });
    }

    res.json({
      totalPosts,
      categoryCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error generating statistics' });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getStats,
};
