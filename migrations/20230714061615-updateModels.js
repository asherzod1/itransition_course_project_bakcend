'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Topics', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name_uz: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.createTable('Collections', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name_uz: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description_en: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description_uz: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      extraFields: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '[]',
      },
      photo: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      // TopicId: {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      //   references: {
      //     model: 'Topics',
      //     key: 'id',
      //   },
      // },
    });

    await queryInterface.createTable('CollectionItems', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name_uz: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      CollectionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Collections',
          key: 'id',
        },
      },
    });

    await queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      CollectionItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CollectionItems',
          key: 'id',
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tags');
    await queryInterface.dropTable('CollectionItems');
    await queryInterface.dropTable('Collections');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Topics');
  },
};
