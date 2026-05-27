'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pedido', {
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
            total: {
                allowNull: false,
                type: Sequelize.DECIMAL(10, 2)
            },
            estado: {
                allowNull: false,
                type: Sequelize.STRING,
                defaultValue: 'pendiente'
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
        await queryInterface.dropTable('pedido');
    }
};
