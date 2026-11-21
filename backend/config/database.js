import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || ''

let sequelize

if (connectionString) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
} else {
  // Configuración por defecto o variables separadas
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
      },
      logging: false,
    }
  )
}

export default sequelize
