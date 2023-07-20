'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Collections', 'photo');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Collections', 'photo', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
  },
};
