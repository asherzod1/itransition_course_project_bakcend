'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add timestamps to CollectionItems if not already present
    const collectionItemsTableInfo = await queryInterface.describeTable('CollectionItems');
    if (!collectionItemsTableInfo.createdAt) {
      await queryInterface.addColumn('CollectionItems', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    if (!collectionItemsTableInfo.updatedAt) {
      await queryInterface.addColumn('CollectionItems', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }

    // Add timestamps to Tags if not already present
    const tagsTableInfo = await queryInterface.describeTable('Tags');
    if (!tagsTableInfo.createdAt) {
      await queryInterface.addColumn('Tags', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    if (!tagsTableInfo.updatedAt) {
      await queryInterface.addColumn('Tags', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }

    // Add timestamps to Topics if not already present
    const topicsTableInfo = await queryInterface.describeTable('Topics');
    if (!topicsTableInfo.createdAt) {
      await queryInterface.addColumn('Topics', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    if (!topicsTableInfo.updatedAt) {
      await queryInterface.addColumn('Topics', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }

    // Add timestamps to ExtraFields if not already present
    const extraFieldsTableInfo = await queryInterface.describeTable('ExtraFields');
    if (!extraFieldsTableInfo.createdAt) {
      await queryInterface.addColumn('ExtraFields', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    if (!extraFieldsTableInfo.updatedAt) {
      await queryInterface.addColumn('ExtraFields', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove timestamps from CollectionItems
    await queryInterface.removeColumn('CollectionItems', 'createdAt');
    await queryInterface.removeColumn('CollectionItems', 'updatedAt');

    // Remove timestamps from Tags
    await queryInterface.removeColumn('Tags', 'createdAt');
    await queryInterface.removeColumn('Tags', 'updatedAt');

    // Remove timestamps from Topics
    await queryInterface.removeColumn('Topics', 'createdAt');
    await queryInterface.removeColumn('Topics', 'updatedAt');

    // Remove timestamps from ExtraFields
    await queryInterface.removeColumn('ExtraFields', 'createdAt');
    await queryInterface.removeColumn('ExtraFields', 'updatedAt');
  },
};
