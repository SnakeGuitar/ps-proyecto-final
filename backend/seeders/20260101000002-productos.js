'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('producto', [
            { id: 1, titulo: 'Televisor Oled Smart Tv LG 42" 4k Uhd', descripcion: 'Televisor Oled Smart Tv LG 42" 4k Uhd Tv Oled42c3psa 2023 es un producto de última tecnología.', precio: 13080.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 2, titulo: 'Xiaomi Poco M5s 8gb 256gb 6.43 Amoled 64mp 5000mah 33w Azul', descripcion: 'Xiaomi Poco M5s con pantalla Amoled de 6.43"', precio: 2399.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 3, titulo: 'Apple MacBook Air (13 pulgadas, 2020, Chip M1, 256 GB de SSD, 8 GB de RAM)', descripcion: 'Apple MacBook Air con Chip M1 - Gris espacial', precio: 25999.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 4, titulo: 'Haley Taurus Licuadora Vaso Plástico De 1.25 Litros 4 Velo Color Negro', descripcion: 'Licuadora con vaso plástico de 1.25 litros', precio: 365.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 5, titulo: 'Silla ergonómica de oficina', descripcion: 'Silla ergonómica con soporte lumbar', precio: 2500.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 6, titulo: 'Bolsa de mano para mujer', descripcion: 'Bolsa de mano elegante', precio: 850.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 7, titulo: 'Balón de fútbol profesional', descripcion: 'Balón oficial de competencia', precio: 450.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 8, titulo: 'Set de herramientas básicas', descripcion: 'Set de 50 piezas para construcción', precio: 1200.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 9, titulo: 'Escritorio de oficina', descripcion: 'Escritorio de madera con cajones', precio: 3500.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 10, titulo: 'Set de juguetes educativos', descripcion: 'Bloques de construcción para niños', precio: 650.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 11, titulo: 'Cuna para bebé', descripcion: 'Cuna de madera con barandales', precio: 4500.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 12, titulo: 'Báscula digital', descripcion: 'Báscula corporal con análisis', precio: 750.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 13, titulo: 'Set de maquillaje profesional', descripcion: 'Estuche de maquillaje completo', precio: 1100.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 14, titulo: 'PlayStation 5', descripcion: 'Consola PlayStation 5 estándar', precio: 12999.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 15, titulo: 'Kit de despensa básica', descripcion: 'Kit con productos básicos del supermercado', precio: 850.00, archivoid: null, createdAt: new Date(), updatedAt: new Date() }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('producto', null, {});
    }
};
