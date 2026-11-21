import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const WhatsAppLog = sequelize.define(
  'WhatsAppLog',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    remitente: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    mensajeUsuario: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'mensaje_usuario',
    },
    respuestaEnviada: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'respuesta_enviada',
    },
    coincidenciaTipo: {
      type: DataTypes.STRING(50),
      field: 'coincidencia_tipo',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    tableName: 'whatsapp_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
)

export default WhatsAppLog
