const Order = require("../models/order.model");
const ExportReceipt = require("../models/export-receipt.model");

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
      const { user_id, recipient_name, recipient_phone, recipient_address, total_price, order_items, note } = req.body;

      if (!recipient_name || !recipient_phone || !recipient_address || !total_price || !Array.isArray(order_items) || order_items.length === 0) {
        return res.status(400).json({
          message: "Thiếu thông tin đơn hàng hoặc không có sản phẩm.",
        });
      }
      const result = await Order.createOrder({
        user_id,
        recipient_name,
        recipient_phone,
        recipient_address,
        total_price,
        order_items,
        note,
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
      const { status, user_id } = req.body;

      const existingOrder = await Order.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại." });
      }

      const result = await Order.updateOrder(id, { status });
      if (status === "confirmed" && existingOrder.status !== "confirmed") {
        const orderItems = await Order.getOrderById(id); // bạn cần có hàm này
        const export_receipt_details = orderItems.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          voucher_id: item.voucher_id,
          total_price: item.total_price,
          shipping_address: item.shipping_address,
          recipient_name: item.recipient_name,
          recipient_phone: item.recipient_phone,
          order_items: item.order_items,
        }));

        await ExportReceipt.createExportReceipt({
          order_id: id,
          export_date: new Date(),
          total_amount: existingOrder.total_price,
          user_id,
          status: "pending",
          export_receipt_details,
        });
      }

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
