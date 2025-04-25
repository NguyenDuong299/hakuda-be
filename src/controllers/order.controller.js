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
      const { user_id, recipient_name, recipient_phone, recipient_address, total_price, order_items } = req.body;

      if (!recipient_name || !recipient_phone || !recipient_address || !total_price || !Array.isArray(order_items) || order_items.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin đơn hàng hoặc không có sản phẩm." });
      }
      const result = await Order.createOrder({
        user_id,
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

  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await Order.updateOrder(id, {
        status,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;
      await Order.deleteOrder(id);
      res.json({ message: "Xóa đơn hàng thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = orderController;
