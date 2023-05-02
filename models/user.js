'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profil, {foreignKey:{name:'uuidProfil', allowNull:false}}),
      User.hasMany(models.Post),
      User.hasMany(models.Comment),
      User.hasMany(models.Like)
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    isProfil: DataTypes.BOOLEAN,
    uuidProfil: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};