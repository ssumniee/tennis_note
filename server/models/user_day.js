"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_day extends Model {
    static associate(models) {
      models.user_day.belongsTo(models.user, {
        foreignKey: { name: "user_id", allowNull: true },
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      models.user_day.belongsTo(models.day, {
        foreignKey: { name: "day_id", allowNull: true },
        targetKey: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  user_day.init(
    {
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      day_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "user_day",
      tableName: "user_days",
      timestamps: true,
      underscored: false,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  return user_day;
};
