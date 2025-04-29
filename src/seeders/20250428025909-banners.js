"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("banners", [
      {
        name: "Banner 1",
        description: "Banner 1 description",
        image: "public/upload/banner2.webp",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("banners", null, {});
  },
};
