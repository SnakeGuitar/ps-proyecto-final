'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('carrito_item', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            usuarioemail: {
                allowNull: false,
                type: Sequelize.STRING
            },
            productoid: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'producto',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            cantidad: {
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            precio: {
                allowNull: false,
                type: Sequelize.DECIMAL(10, 2)
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
        await queryInterface.dropTable('carrito_item');
    }
};
