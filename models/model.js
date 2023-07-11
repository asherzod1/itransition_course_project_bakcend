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

const Collection = sequelize.define('Message', {
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
    description_en: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description_uz: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    extraFields: {
        type: DataTypes.ARRAY,
        allowNull: false,
    }
},{
    timestamps: false,
});

const CollectionItem = sequelize.define('Message', {
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
},{
    timestamps: false,
});

const Topic = sequelize.define('Tag', {
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

Tag.belongsTo(CollectionItem, {
    foreignKey: 'CollectionItemId',
    as: 'tag'
});

Topic.belongsTo(Collection, {
    foreignKey: 'CollectionId',
    as: 'topic'
});

module.exports = { User, Collection, CollectionItem, Tag, Topic };
