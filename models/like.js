'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Like.belongsTo(models.Post, {foreignKey:{name:'uuidPost', allowNull: false}}),
      Like.belongsTo(models.User, {foreignKey:{name:'uuidUser', allowNull:false}}),
      Like.belongsTo(models.Profil, {foreignKey:{name:'uuidProfil', allowNull:false}})
    }
  }
  Like.init({
    uuidPost: DataTypes.UUID,
    uuidUser: DataTypes.UUID,
    uuidProfil: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};