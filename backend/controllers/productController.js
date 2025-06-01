const Product = require("../models/Product");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort, limit } = req.query;

    let query = {};

    // 🔍 Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    // 🎯 Filter by category
    if (category) {
      query.category = category;
    }

    let productQuery = Product.find(query);

    // ⬇️ Sort (e.g., ?sort=price or ?sort=-price)
    if (sort) {
      productQuery = productQuery.sort(sort);
    }

    // 📉 Limit results
    const max = parseInt(limit) || 0;
    if (max > 0) {
      productQuery = productQuery.limit(max);
    }

    const products = await productQuery;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
