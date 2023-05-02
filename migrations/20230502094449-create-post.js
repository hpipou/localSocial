'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      message: {
        allowNull: false,
        type: Sequelize.STRING
      },
      uuidUser: {
        allowNull: false,
        type: Sequelize.UUID,
        references:{
          model:'Users',
          key:'id'
        }
      },
      uuidProfil: {
        allowNull: false,
        type: Sequelize.UUID,
        references:{
          model:'Profils',
          key:'id'
        }
      },
      nbLike: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      nbComment: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};