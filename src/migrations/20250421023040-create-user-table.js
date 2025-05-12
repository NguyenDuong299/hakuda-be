"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        phoneNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        addressProvinceCode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        addressDistrictCode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        addressWardCode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        addressDesc: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        role: {
          type: Sequelize.ENUM("1", "2"),
          allowNull: false,
          defaultValue: "2",
        },

        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
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
    await queryInterface.dropTable("users");
  },
};
