'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class pedido extends Model {
        static associate(models) {
            pedido.hasMany(models.pedido_item, { foreignKey: 'pedidoid', as: 'items' });
        }
    }

    pedido.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        usuarioemail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pendiente'
        }
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'pedido',
    });

    return pedido;
};
