import Book from "../models/books.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { title, rating, caption, image } = req.body;

    if (!title || !rating) {
      return res
        .status(400)
        .json({ message: "Please fill the necessary fields" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating should be between 1 and 5" });
    }

    // Upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // Create the book post
    const newBook = new Book({
      title,
      rating,
      caption,
      image: imageUrl,
      user: req.user._id, // Assuming req.user is set in the protectedauthRoute middleware
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// With pagination => Infinite scrolling
export const getPosts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const book = await Book.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      book,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error(error, "Error in getting posts");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePosts = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res.status(500).json({ message: "Error deleting image" });
      }
    }

    await book.deleteOne();

    res.json({ message: "Post deleted successfully" });

  } catch (error) {
    console.error(error, "Error in deleting posts");
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getRecommendedPostsUser = async (req, res) => {
  try {
    const books = await Book
    .find({ user: req.user._id })
    .sort({ createdAt: -1 })

    res.json(books);
  } catch (error) {
    console.error(error, "Error in getting recommended posts");
    return res.status(500).json({ message: "Internal server error" });
  }
}