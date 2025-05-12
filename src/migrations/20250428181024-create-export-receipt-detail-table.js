"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "export_receipt_details",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        export_receipt_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "export_receipts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        product_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "products",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        export_price: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("export_receipt_details");
  },
};
