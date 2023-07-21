const express = require("express");
const sequelize = require('../sequelize');
const {Collection, User, CollectionItem} = require('../models/model');
const verifyToken = require("../middlewares/tokenMiddleware");
const {Topics} = require("../models/constants");


collectionRouter = express.Router();

collectionRouter.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        const isAdmin = user.is_admin;
        let collections = await Collection.findAll({
            where: {
                authorId: req.user.userId,
            },
            include: [{model: User, as: 'author'}],
        });
        if (isAdmin) {
            collections = await Collection.findAll({
                include: [{model: User, as: 'author'}],
            });
        }
        const collectionsWithTranslatedName = collections.map(collection => {
            const attributeName = `name_${req.language}`;
            console.log("attributeName", attributeName)
            const translatedName = collection.get(attributeName); // Access the translated name using get() method
            const attributeDescription = `description_${req.language}`;
            const translatedDescription = collection.get(attributeDescription);
            const topic = [...Topics].find(topic => topic.id === collection?.idTopic);
            topic.name = topic[`name_${req.language}`];
            return {
                ...collection.toJSON(),
                name: translatedName,
                description: translatedDescription,
                topic
            };
        });

        res.json(collectionsWithTranslatedName);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});


Collection.hasMany(CollectionItem, { foreignKey: 'CollectionId', as: 'collectionItems' });
collectionRouter.get('/home', async (req, res) => {
    try {
        // const collections = await Collection.findAll({
        //     include: [{model: User, as: 'author'}],
        // });
        let collections = await Collection.findAll({
            attributes: [
                'id',
                'name_en',
                'name_uz',
                'description_en',
                'description_uz',
                'extraFields',
                'photo',
                'idTopic',
                [sequelize.fn('COUNT', sequelize.col('collectionItems.id')), 'collectionItemsCount'],
            ],
            include: [
                { model: User, as: 'author' },
                {
                    model: CollectionItem,
                    as: 'collectionItems',
                    attributes: [], // Exclude other attributes of CollectionItem from the main query
                },
            ],
            group: ['Collection.id'], // Group by Collection.id to get the count of CollectionItems per Collection
        });
        collections = collections.sort((a, b) => b.collectionItemsCount - a.collectionItemsCount);
        if(collections.length > 5) {
            collections = collections.splice(0, 5);
        }
        const collectionsWithTranslatedName = collections?.map(collection => {
            const attributeName = `name_${req.language}`;
            console.log("attributeName", attributeName)
            const translatedName = collection.get(attributeName); // Access the translated name using get() method
            const attributeDescription = `description_${req.language}`;
            const translatedDescription = collection.get(attributeDescription);
            const topic = [...Topics].find(topic => topic.id === collection?.idTopic);
            topic.name = topic[`name_${req.language}`];
            return {
                ...collection.toJSON(),
                name: translatedName,
                description: translatedDescription,
                topic
            };
        });

        console.log("collectionsWithTranslatedName", collectionsWithTranslatedName)

        res.json(collectionsWithTranslatedName);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

collectionRouter.get('/:id', async (req, res) => {
    try {
        const collection = await Collection.findByPk(req.params.id, {
            include: [{model: User, as: 'author'}],
        });

        if (collection) {
            const attributeName = `name_${req.language}`;
            const attributeDescription = `description_${req.language}`;
            const translatedName = collection.get(attributeName); // Access the translated name using get() method
            const translatedDescription = collection.get(attributeDescription); // Access the translated name using get() method
            const topic = [...Topics].find(topic => topic.id === collection.idTopic);
            topic.name = topic[`name_${req.language}`];
            let translatedcollection = {
                ...collection.toJSON(),
                name: translatedName,
                description: attributeDescription,
                topic
            };
            res.json(translatedcollection);
        } else {
            res.status(404).json({message: 'Collection not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});


collectionRouter.post('/', verifyToken, async (req, res) => {
    try {
        const {name_en, name_uz, description_en, description_uz, extraFields, photo, idTopic} = req.body;
        const authorId = req.user.userId; // Extract the authorId from req.user
        const createdAt = new Date();
        const updatedAt = new Date();
        const photoFilePath = req.file ? req.file.path : null;
        const photoFilename = photoFilePath ? `${uuidv4()}${path.extname(photoFilePath)}` : null;
        console.log("AuthorID: ", authorId)
        const collection = await Collection.create({
            name_en,
            name_uz,
            description_en,
            description_uz,
            extraFields,
            photo,
            authorId,
            createdAt,
            updatedAt,
            idTopic
        });
        res.status(201).json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

collectionRouter.put('/:id', verifyToken, async (req, res) => {
    try {
        const {name_en, name_uz, description_en, description_uz, extraFields, photo, idTopic} = req.body;
        const collection = await Collection.findByPk(req.params.id);
        const authorId = req.user.userId;
        if (collection) {
            collection.name_en = name_en;
            collection.name_uz = name_uz;
            collection.description_en = description_en;
            collection.description_uz = description_uz;
            collection.extraFields = extraFields;
            collection.photo = photo;
            collection.authorId = authorId;
            collection.idTopic = idTopic;
            await collection.save();
            res.json(collection);
        } else {
            res.status(404).json({message: 'Collection not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

collectionRouter.delete('/:id', verifyToken, async (req, res) => {
    try {
        const collection = await Collection.findByPk(req.params.id);
        if (collection) {
            await collection.destroy();
            res.json({message: 'Collection deleted successfully'});
        } else {
            res.status(404).json({message: 'Collection not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});


module.exports = collectionRouter;
