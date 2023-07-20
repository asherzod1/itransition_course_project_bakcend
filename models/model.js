const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

});

User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
});

// Method to compare entered password with the hashed password
User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_uz: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description_en: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description_uz: {
        type: DataTypes.STRING,
        allowNull: false
    },
    extraFields: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '[]',
    },
    photo: {
        type: DataTypes.STRING, // Change the data type to STRING
        allowNull: true,
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const CollectionItem = sequelize.define('CollectionItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name_uz: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const Topic = sequelize.define('Topic', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name_uz: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const CollectionExtraField = sequelize.define('CollectionExtraField', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameUnique: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const TagItem = sequelize.define('TagItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    value:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},{
    timestamps: false,
});

Collection.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author',
});
CollectionItem.belongsTo(Collection, {
    foreignKey: 'CollectionId',
    as: 'collection'
});

Like.belongsTo(CollectionItem, {
    foreignKey: 'CollectionItemId',
    as: 'collectionItem'
});

Like.belongsTo(User, {
    foreignKey: 'UserId',
    as: 'user'
});
Comment.belongsTo(CollectionItem, {
    foreignKey: 'CollectionItemId',
    as: 'collectionItem'
});

Comment.belongsTo(User, {
    foreignKey: 'UserId',
    as: 'user'
});

TagItem.belongsTo(CollectionItem, {
    foreignKey: 'CollectionItemId',
    as: 'collectionItem'
});
TagItem.belongsTo(Tag, {
    foreignKey: 'TagId',
    as: 'Tag'
});


Topic.belongsTo(Collection, {
    foreignKey: 'CollectionId',
    as: 'topic'
});

CollectionExtraField.belongsTo(CollectionItem, {
    foreignKey: 'CollectionItemId',
    as: 'collectionItem',
});

module.exports = { User, Collection, CollectionItem, Tag, Topic, CollectionExtraField, TagItem, Like, Comment };
