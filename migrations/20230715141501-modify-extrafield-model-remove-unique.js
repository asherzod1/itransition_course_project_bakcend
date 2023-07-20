'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ExtraFields', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('ExtraFields', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('ExtraFields', 'value', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ExtraFields', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('ExtraFields', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('ExtraFields', 'value', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
