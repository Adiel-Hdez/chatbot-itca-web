import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const Faq = sequelize.define(
  'Faq',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pregunta: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    palabrasClave: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'palabras_clave',
    },
    respuesta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
  }
)

export default Faq
