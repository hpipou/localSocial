'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.Post, {foreignKey:{name:'uuidPost', allowNull: false}}),
      Comment.belongsTo(models.User, {foreignKey:{name:'uuidUser', allowNull:false}}),
      Comment.belongsTo(models.Profil, {foreignKey:{name:'uuidProfil', allowNull:false}})
    }
  }
  Comment.init({
    message: DataTypes.STRING,
    uuidPost: DataTypes.UUID,
    uuidUser: DataTypes.UUID,
    uuidProfil: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};