const Order = require("../models/order.model");
const ExportReceipt = require("../models/export-receipt.model");
const { sendOrderStatusEmail } = require("../utils/mailer");

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
      const { user_id, recipient_name, recipient_email, recipient_phone, recipient_address, total_price, order_items, note } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!recipient_name || !recipient_email || !recipient_phone || !recipient_address || !total_price || !Array.isArray(order_items) || order_items.length === 0) {
        return res.status(400).json({
          message: "Thiếu thông tin đơn hàng hoặc không có sản phẩm.",
        });
      }

      // Tạo đơn hàng
      const result = await Order.createOrder({
        user_id,
        recipient_name,
        recipient_email,
        recipient_phone,
        recipient_address,
        total_price,
        order_items,
        note,
      });
      const formatPrice = total_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
      // Gửi email thông báo khi tạo đơn hàng thành công
      const htmlContent = `
        <h1>Cảm ơn bạn đã đặt hàng tại Bandai Shop!</h1>
        <p>Chúng tôi đã nhận được đơn hàng của bạn với các chi tiết sau:</p>
        <p><strong>Người nhận:</strong> ${recipient_name}</p>
        <p><strong>Email:</strong> ${recipient_email}</p>
        <p><strong>Số điện thoại:</strong> ${recipient_phone}</p>
        <p><strong>Địa chỉ nhận:</strong> ${recipient_address}</p>
        <p><strong>Tổng giá trị:</strong> ${formatPrice} VND</p>
        <p><strong>Trạng thái:</strong> Chờ xác nhận</p>
        <p><strong>Ghi chú:</strong> ${note ? note : "Không có ghi chú"}</p>
        <p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Cảm ơn bạn đã tin tưởng mua sắm tại Bandai Shop!</p>
      `;
      // Gửi email thông báo
      await sendOrderStatusEmail(recipient_email, "Xác nhận đơn hàng của bạn tại Hakuda Shop", htmlContent);

      // Trả về kết quả cho API response
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

      const updatedOrderResult = await Order.updateOrder(id, { status });

      // Nếu đơn hàng được xác nhận
      if (status === "confirmed" && existingOrder.status !== "confirmed") {
        const export_receipt_details = existingOrder.order_items.map((item) => ({
          export_receipt_id: existingOrder.id, // optional
          product_id: item.product_id,
          quantity: item.quantity,
          export_price: item.price,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        const exportReceiptResult = await ExportReceipt.createExportReceipt({
          order_id: existingOrder.id,
          export_date: new Date(),
          total_amount: existingOrder.total_price,
          user_id,
          status: "pending",
          export_receipt_details,
        });

        return res.json({
          result: exportReceiptResult,
          message: "Chỉnh sửa đơn hàng và tạo biên lai thành công!",
        });
      }

      const { recipient_name, recipient_email, recipient_phone, recipient_address, total_price, note } = existingOrder;
      let statusMessage = "";
      let statusTitle = "";

      switch (status) {
        case "pending":
          statusTitle = "Chờ xác nhận";
          statusMessage = "Đơn hàng của bạn đang chờ xác nhận từ cửa hàng. Chúng tôi sẽ xử lý ngay khi nhận được xác nhận.";
          break;
        case "confirmed":
          statusTitle = "Đã xác nhận";
          statusMessage = "Đơn hàng của bạn đã được xác nhận. Chúng tôi đang chuẩn bị để gửi hàng cho bạn.";
          break;
        case "shipped":
          statusTitle = "Đã giao hàng";
          statusMessage = "Đơn hàng của bạn đã được giao đi. Bạn sẽ nhận được hàng trong thời gian sớm nhất.";
          break;
        case "delivered":
          statusTitle = "Đã giao hàng thành công";
          statusMessage = "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại Hakuda Shop!";
          break;
        case "cancelled":
          statusTitle = "Đã huỷ";
          statusMessage = "Đơn hàng của bạn đã bị huỷ. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.";
          break;
        default:
          statusTitle = "Trạng thái không xác định";
          statusMessage = "Trạng thái đơn hàng không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      }
      const htmlContent = `
        <h1>Cảm ơn bạn đã đặt hàng tại Bandai Shop!</h1>
        <p>Chúng tôi đã nhận được đơn hàng của bạn với các chi tiết sau:</p>
        <p><strong>Người nhận:</strong> ${recipient_name}</p>
        <p><strong>Email:</strong> ${recipient_email}</p>
        <p><strong>Số điện thoại:</strong> ${recipient_phone}</p>
        <p><strong>Địa chỉ nhận:</strong> ${recipient_address}</p>
        <p><strong>Tổng giá trị:</strong> ${total_price} VND</p>
        <li><strong>Trạng thái:</strong> ${statusTitle}</li>
        <li><strong>Trạng thái:</strong> ${statusMessage}</li>
        <p><strong>Ghi chú:</strong> ${note || "Không có ghi chú"}</p>
        <p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Cảm ơn bạn đã tin tưởng mua sắm tại Bandai Shop!</p>
      `;

      await sendOrderStatusEmail(recipient_email, "Xác nhận đơn hàng của bạn tại Bandai Shop", htmlContent);

      res.json({ result: updatedOrderResult, message: "Chỉnh sửa đơn hàng thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.getOrderById(id);
      res.json(order);
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
