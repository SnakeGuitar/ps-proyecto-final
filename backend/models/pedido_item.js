'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class pedido_item extends Model {
        static associate(models) {
            pedido_item.belongsTo(models.pedido, { foreignKey: 'pedidoid' });
        }
    }

    pedido_item.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pedidoid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productoid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'pedido_item',
    });

    return pedido_item;
};
