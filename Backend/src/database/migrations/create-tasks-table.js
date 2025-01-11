'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      // Use JSON type for fileAttachments
      fileAttachments: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      dueDateTime: {
        type: Sequelize.DATE,
      },
      completionStatus: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: false,
      },
      completionDateTime: {
        type: Sequelize.DATE,
      },
      todoListId: {
        type: Sequelize.INTEGER,
        references: { model: 'todolists', key: 'id' },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('tasks');
  },
};
