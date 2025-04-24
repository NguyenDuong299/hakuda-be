const Order = require("../models/order.model");

const orderController = {
  getAllOrder: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalOrder = await Order.getTotalOrder(search);
      const orders = await Order.getAllOrder(limit, offset, search);

      res.json({ page, totalOrder, orders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  createOrder: async (req, res) => {
    try {
      const { recipient_name, recipient_phone, recipient_address, total_price, order_items } = req.body;

      if (!recipient_name || !recipient_phone || !recipient_address || !total_price || !Array.isArray(order_items) || order_items.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin đơn hàng hoặc không có sản phẩm." });
      }
      const result = await Order.createOrder({
        recipient_name,
        recipient_phone,
        recipient_address,
        total_price,
        order_items,
      });
      res.status(201).json(result);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: "Lỗi khi tạo đơn hàng.", error: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, detail, price, stock_quantity, isDiscount, hot, brand_id, product_line_id, images } = req.body;
      const existingProduct = await Product.getAllProduct();
      const isDuplicate = existingProduct.some((v) => v.name === name && v.id !== parseInt(id));
      if (isDuplicate) {
        return res.status(400).json({ message: "Sản phẩm đã tồn tại!" });
      }
      const productData = {
        name,
        description,
        detail,
        price,
        stock_quantity,
        isDiscount,
        hot,
        brand_id,
        product_line_id,
      };
      await Product.updateProduct(id, productData);
      if (images) {
        await Product.deleteProductImages(id);
        if (images.length > 0) {
          const imageRows = images.map((url) => [id, url.image_url, url.isThumbnail]);
          await Product.addProductImages(imageRows);
        }
      }

      res.json({ message: "Chỉnh sửa sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await Product.deleteProduct(id);
      res.json({ message: "Xóa sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = orderController;
