'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('Collections', 'topicId', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   defaultValue: 1,
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Collections', 'topicId');
  }
};
