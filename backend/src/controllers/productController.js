const Product = require('../models/Product');

// Create a new product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Error creating product', error: err.message });
  }
};

// Get all products (with optional query params for search/filter)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// Update a product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
};

// Delete a product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products by category', error: err.message });
  }
};

// Update inventory for a product (admin only)
exports.updateInventory = async (req, res) => {
  try {
    const { quantity, minThreshold, maxCapacity, inStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity !== undefined) product.inventory.quantity = quantity;
    if (minThreshold !== undefined) product.inventory.minThreshold = minThreshold;
    if (maxCapacity !== undefined) product.inventory.maxCapacity = maxCapacity;
    if (inStock !== undefined) product.inventory.inStock = inStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Error updating inventory', error: err.message });
  }
};

// Get products below minThreshold (restock alert)
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ 'inventory.quantity': { $lte: { $ifNull: ['$inventory.minThreshold', 0] } } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low stock products', error: err.message });
  }
}; 