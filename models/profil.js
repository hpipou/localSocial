'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profil extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profil.belongsTo(models.User,{foreignKey:{name:'uuidUser', allowNull:false}}),
      Profil.hasMany(models.Post),
      Profil.hasMany(models.Like),
      Profil.hasMany(models.Comment)
    }
  }
  Profil.init({
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    adresse: DataTypes.STRING,
    country: DataTypes.STRING,
    image: DataTypes.STRING,
    uuidUser: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Profil',
  });
  return Profil;
};