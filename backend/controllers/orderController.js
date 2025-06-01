const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  const { product, quantity } = req.body;

  try {
    const selectedProduct = await Product.findById(product);
    if (!selectedProduct)
      return res.status(404).json({ message: "Product not found" });

    if (selectedProduct.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Reduce product quantity
    selectedProduct.quantity -= quantity;
    await selectedProduct.save();

    const order = new Order({
      product,
      quantity,
      orderedBy: req.user.id, // pulled from token via middleware
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { search, from, to, sort, limit } = req.query;

    let query = {};

    // 🔎 Search by product name
    if (search) {
      const matchingProducts = await Product.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      query.product = { $in: matchingProducts.map((p) => p._id) };
    }

    // 📅 Filter by date range
    if (from || to) {
      query.orderDate = {};
      if (from) query.orderDate.$gte = new Date(from);
      if (to) query.orderDate.$lte = new Date(to);
    }

    let orderQuery = Order.find(query)
      .populate("product", "name price")
      .populate("orderedBy", "name email");

    // ⬇️ Sort
    if (sort) {
      orderQuery = orderQuery.sort(sort);
    }

    // 📉 Limit
    const max = parseInt(limit) || 0;
    if (max > 0) {
      orderQuery = orderQuery.limit(max);
    }

    const orders = await orderQuery;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getOrderStats = async (req, res) => {
  try {
    const { from, to } = req.query;

    let dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    let matchStage = {};
    if (from || to) {
      matchStage.orderDate = dateFilter;
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $multiply: ["$quantity", "$productInfo.price"] },
          },
        },
      },
    ]);

    const result = stats[0] || { totalOrders: 0, totalRevenue: 0 };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
