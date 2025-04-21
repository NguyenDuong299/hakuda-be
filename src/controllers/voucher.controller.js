const Voucher = require("../models/voucher.model");

const voucherController = {
  getAllVoucher: (req, res) => {
    Voucher.getAllVoucher()
      .then((vouchers) => res.json({ vouchers }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  createVoucher: async (req, res) => {
    const { code, discountType, discountValue, quantity, startDate, endDate } = req.body;
    if (code === "" || discountType === "" || discountValue === "" || quantity === "" || startDate === "" || endDate === "") {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các trường!" });
    }
    const voucher = await Voucher.getAllVoucher(code);
    const existingVoucher = voucher.find((u) => u.code === code);

    if (existingVoucher) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
    }
    const newVoucher = { code, discountType, discountValue, quantity, startDate, endDate };
    Voucher.createVoucher(newVoucher)
      .then((result) => res.status(201).json({ id: result.insertId, ...newVoucher, message: "Thêm Voucher thành công!" }))
      .catch((err) => res.status(500).send(err));
  },
  updateVoucher: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Voucher.updateVoucher(id, data)
      .then((result) => res.json({ message: "Chỉnh sửa Voucher thành công!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deleteVoucher: (req, res) => {
    const { id } = req.params;
    Voucher.deleteVoucher(id)
      .then(() => res.json({ message: "Xóa voucher thành công!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = voucherController;
