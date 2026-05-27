'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class carrito_item extends Model {
        static associate(models) {
            carrito_item.belongsTo(models.producto, { foreignKey: 'productoid' });
        }
    }

    carrito_item.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        usuarioemail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        productoid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'carrito_item',
    });

    return carrito_item;
};
