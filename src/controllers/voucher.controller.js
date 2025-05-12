const Voucher = require("../models/voucher.model");

const voucherController = {
  getAllVoucher: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalVoucher = await Voucher.getTotalVoucher(search);
      const vouchers = await Voucher.getAllVoucher(limit, offset, search);

      res.json({ page, totalVoucher, vouchers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createVoucher: async (req, res) => {
    try {
      const { code, discountType, discountValue, quantity, startDate, endDate } = req.body;

      if (!code || !discountType || !discountValue || !quantity || !startDate || !endDate) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ các trường!" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({ message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!" });
      }

      const existingVouchers = await Voucher.getAllVoucher();
      const isDuplicate = existingVouchers.some((v) => v.code === code);

      if (isDuplicate) {
        return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
      }

      const newVoucher = { code, discountType, discountValue, quantity, startDate, endDate };
      const result = await Voucher.createVoucher(newVoucher);

      res.status(201).json({
        id: result.insertId,
        ...newVoucher,
        message: "Thêm Voucher thành công!",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  checkVoucher: async (req, res) => {
    try {
      const { code } = req.params;
      const result = await Voucher.checkVoucher(code);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateVoucher: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existingVouchers = await Voucher.getAllVoucher();
      const isDuplicate = existingVouchers.some((v) => v.code === data.code && v.id !== parseInt(id));

      if (isDuplicate) {
        return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
      }

      await Voucher.updateVoucher(id, data);
      res.json({ message: "Chỉnh sửa Voucher thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteVoucher: async (req, res) => {
    try {
      const { id } = req.params;
      await Voucher.deleteVoucher(id);
      res.json({ message: "Xóa voucher thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = voucherController;
