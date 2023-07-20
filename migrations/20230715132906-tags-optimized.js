'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Create TagItem model
    await queryInterface.createTable('TagItems', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      CollectionItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CollectionItems',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      TagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Remove CollectionItemId column from Tags if it exists
    const tagsTableInfo = await queryInterface.describeTable('Tags');
    if (tagsTableInfo.CollectionItemId) {
      await queryInterface.removeColumn('Tags', 'CollectionItemId');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove TagItem model
    await queryInterface.dropTable('TagItems');

    // Remove Tag belongsTo association
    // Add CollectionItemId column to Tags if it doesn't exist
    const tagsTableInfo = await queryInterface.describeTable('Tags');
    if (!tagsTableInfo.CollectionItemId) {
      await queryInterface.addColumn('Tags', 'CollectionItemId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CollectionItems',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

  },
};
