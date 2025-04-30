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
      const {
        user_id,
        recipient_name,
        recipient_phone,
        recipient_address,
        total_price,
        order_items,
      } = req.body;

      if (
        !recipient_name ||
        !recipient_phone ||
        !recipient_address ||
        !total_price ||
        !Array.isArray(order_items) ||
        order_items.length === 0
      ) {
        return res
          .status(400)
          .json({
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
      });
      res.status(201).json(result);
    } catch (err) {
      console.error("Error creating order:", err);
      res
        .status(500)
        .json({ message: "Lỗi khi tạo đơn hàng.", error: err.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, user_id } = req.body; // cần có user_id để tạo hóa đơn xuất

      const existingOrder = await Order.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại." });
      }

      const result = await Order.updateOrder(id, { status });

      // Chỉ tạo hóa đơn xuất khi trạng thái chuyển sang 'confirm'
      if (status === "confirm" && existingOrder.status !== "confirm") {
        // Giả sử đơn hàng có sẵn tổng tiền và danh sách sản phẩm chi tiết
        const orderItems = await Order.getOrderItems(id); // bạn cần có hàm này
        const export_receipt_details = orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        }));

        await ExportReceipt.createExportReceipt({
          order_id: id,
          export_date: new Date(),
          total_amount: existingOrder.total_price,
          user_id, // truyền từ client hoặc hệ thống
          status: "done", // hoặc 'processing' tùy theo business
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
