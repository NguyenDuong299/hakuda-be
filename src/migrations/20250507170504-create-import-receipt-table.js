"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "import_receipts",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        supplier_id: {
          type: Sequelize.INTEGER,
          references: {
            model: "suppliers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        import_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        total_amount: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
        },
        note: {
          type: Sequelize.STRING,
          allowNull: true,
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
    await queryInterface.dropTable("import_receipts");
  },
};
