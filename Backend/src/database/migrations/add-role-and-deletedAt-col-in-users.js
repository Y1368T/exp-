'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false,
      after: 'email',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'deletedAt');
    await queryInterface.removeColumn('users', 'role');
  },
};
