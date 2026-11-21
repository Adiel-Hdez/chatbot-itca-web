import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING(50),
      defaultValue: 'ADMIN',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    tableName: 'admins',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
)

export default Admin
