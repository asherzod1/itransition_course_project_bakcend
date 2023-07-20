'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'topicId' column to the 'Collections' table
    await queryInterface.addColumn('Collections', 'idTopic', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'topicId' column from the 'Collections' table on rollback
    await queryInterface.removeColumn('Collections', 'idTopic');
  }
};
