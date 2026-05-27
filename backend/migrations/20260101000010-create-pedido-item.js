'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pedido_item', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            pedidoid: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'pedido',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            productoid: {
                allowNull: true,
                type: Sequelize.INTEGER
            },
            titulo: {
                allowNull: false,
                type: Sequelize.STRING
            },
            precio: {
                allowNull: false,
                type: Sequelize.DECIMAL(10, 2)
            },
            cantidad: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('pedido_item');
    }
};
