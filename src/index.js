const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 3000;
db.connect((err) => {
  if (err) {
    console.error("Không thể kết nối đến MySQL:", err);
    process.exit(1);
  }
  console.log("Đã kết nối MySQL thành công!");
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
});
