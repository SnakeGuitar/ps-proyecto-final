// Opciones comunes para todos los entornos
const seederStorage = {
    // Guarda en BD qué seeders ya corrieron, igual que las migraciones.
    // Evita el error de "Validation error" al reiniciar el contenedor.
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeSeedMeta'
}

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        ...seederStorage
    },
    test: {
        username: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
        database: process.env.TEST_DB_DATABASE,
        host: process.env.TEST_DB_HOST,
        port: process.env.TEST_DB_PORT,
        dialect: 'mysql',
        ...seederStorage
    },
    production: {
        // R-04: Usar las mismas variables DB_* que development para alinear con Docker Compose
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        ...seederStorage
    }
}
