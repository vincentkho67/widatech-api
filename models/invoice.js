'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoice.hasMany(models.InvoiceDetail, { foreignKey: 'invoice_id' });
    }
  }
  Invoice.init({
    customer: DataTypes.STRING,
    salesperson: DataTypes.STRING,
    payment_type: DataTypes.ENUM('CASH', 'CREDIT', 'NOTCASHORCREDIT'),
    notes: DataTypes.TEXT,
    discarded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};