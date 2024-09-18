'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      InvoiceDetail.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
      InvoiceDetail.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  InvoiceDetail.init({
    quantity: DataTypes.INTEGER,
    invoice_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    discarded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'InvoiceDetail',
  });
  return InvoiceDetail;
};