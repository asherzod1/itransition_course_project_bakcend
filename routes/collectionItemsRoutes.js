const express = require('express');
const sequelize = require('../sequelize');
const {Collection, CollectionItem, CollectionExtraField, Tag, TagItem, User, Like, Comment} = require('../models/model');
const verifyToken = require("../middlewares/tokenMiddleware");
const { Op } = require('sequelize');
const collectionItemsRouter = express.Router();

collectionItemsRouter.post('/', verifyToken, async (req, res) => {
    try {
        const {name_en, name_uz, collectionId, extraFields, tags} = req.body;
        const collectionItem = await CollectionItem.create({
            name_en,
            name_uz,
            CollectionId: collectionId,
        });
        const extraF = extraFields?.map(async (extraField) => {
            await CollectionExtraField.create({
                CollectionItemId: collectionItem.id,
                name: extraField.name,
                type: extraField.type,
                value: extraField.value,
                nameUnique: `${collectionItem.id}_${extraField.name}`,
            });
        })
        const newTags = tags?.map(async (item) => {
            const [tag, created] = await Tag.findOrCreate({
                where: {
                    name: item,
                },
            });
            const tagItem = await TagItem.create({
                TagId: tag.id,
                CollectionItemId: collectionItem.id,
            })

        })
        await Promise.all(extraF);
        await Promise.all(newTags);

        const resolvedExtraF = await Promise.all(extraF);
        const resolvedNewTags = await Promise.all(newTags);
        res.status(201).json({ collectionItem, extraFields: resolvedExtraF, tags: resolvedNewTags });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

collectionItemsRouter.get('/', async (req, res) => {
    try {
        const collectionId = req.query.collectionId;
        const userId = req.query.userId;
        const whereCondition = {};

        if (collectionId) {
            whereCondition.CollectionId = collectionId; //
        }

        const collectionItems = await CollectionItem.findAll({
            where: whereCondition,
            include: [{ model: Collection, as: 'collection' }],
        });

        const collectionItemsWithExtraFields = await Promise.all(collectionItems.map(async (collectionItem) => {
            const extraFields = await CollectionExtraField.findAll({
                where: {
                    CollectionItemId: collectionItem.id,
                },
            });
            const  tagsItems = await TagItem.findAll({
                where: {
                    CollectionItemId: collectionItem.id,
                }
            });
            const tags = await Promise.all(tagsItems.map(async (tagItem) => {
                const tag = await Tag.findByPk(tagItem.TagId);
                return tag.name;
            }));
            const likeItems = await Like.findAll({
                where: {
                    CollectionItemId: collectionItem.id,
                },
            });

            let like = {
                likes: 0,
                dislikes: 0,
            }
            likeItems.forEach((likeItem) => {
                console.log("Like item value: ", likeItem.value)
                if (likeItem.value === true || likeItem.value === '1') {
                    like.likes += 1;
                } else {
                    like.dislikes += 1;
                }
            })
            if(userId){
                const userLike = await Like.findOne({
                    where: {
                        CollectionItemId: collectionItem.id,
                        UserId: userId,
                    },
                })
                like.userValue = userLike ? userLike.value : 'none';
                like.userLikeId = userLike ? userLike.id : null;
            }
            else {
                like.userValue = 'none';
                like.userLikeId = null;
            }

            const comments = await Comment.findAll({
                where: {
                    CollectionItemId: collectionItem.id,
                },
            });
            const attributeName = `name_${req.language}`;
            const translatedName = collectionItem.get(attributeName);
            return {
                ...collectionItem.toJSON(),
                extraFields,
                tags,
                like,
                comments: comments.length,
                name: translatedName,
            };
        }));

        res.json(collectionItemsWithExtraFields);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


collectionItemsRouter.get('/:id', async (req, res) => {
    try {
        const collectionItemId = req.params.id;
        const userId = req.query.userId;

        const collectionItem = await CollectionItem.findOne({
            where: { id: collectionItemId },
            include: [{ model: Collection, as: 'collection' }],
        });

        if (!collectionItem) {
            return res.status(404).json({ message: 'CollectionItem not found' });
        }

        const extraFields = await CollectionExtraField.findAll({
            where: { CollectionItemId: collectionItem.id },
        });

        const tagsItems = await TagItem.findAll({
            where: { CollectionItemId: collectionItem.id },
        });

        const tags = await Promise.all(tagsItems.map(async (tagItem) => {
            const tag = await Tag.findByPk(tagItem.TagId);
            return tag.name;
        }));

        const likeItems = await Like.findAll({
            where: { CollectionItemId: collectionItem.id },
        });

        let like = {
            likes: 0,
            dislikes: 0,
        };

        likeItems.forEach((likeItem) => {
            if (likeItem.value === true || likeItem.value === '1') {
                like.likes += 1;
            } else {
                like.dislikes += 1;
            }
        });

        if (userId) {
            const userLike = await Like.findOne({
                where: {
                    CollectionItemId: collectionItem.id,
                    UserId: userId,
                },
            });

            like.userValue = userLike ? userLike.value : 'none';
            like.userLikeId = userLike ? userLike.id : null;
        }
        const attributeName = `name_${req.language}`;
        const translatedName = collectionItem.get(attributeName);
        const collectionItemWithExtraFields = {
            ...collectionItem.toJSON(),
            extraFields,
            tags,
            like,
            name: translatedName,
        };

        res.json(collectionItemWithExtraFields);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

collectionItemsRouter.put('/:id', verifyToken, async (req, res) => {
    try {
        const collectionItemId = req.params.id;
        const { name_en, name_uz, collectionId, extraFields, tags } = req.body;

        // Update the CollectionItem
        const updatedCollectionItem = await CollectionItem.findByPk(collectionItemId);
        if (!updatedCollectionItem) {
            return res.status(404).json({ message: 'CollectionItem not found' });
        }

        updatedCollectionItem.name_en = name_en;
        updatedCollectionItem.name_uz = name_uz;
        updatedCollectionItem.CollectionId = collectionId;

        await updatedCollectionItem.save();

        // Update ExtraFields
        if (extraFields && extraFields.length > 0) {
            await Promise.all(
                extraFields.map(async (extraField) => {
                    const existingExtraField = await CollectionExtraField.findOne({
                        where: {
                            CollectionItemId: collectionItemId,
                            name: extraField.name,
                        },
                    });

                    if (existingExtraField) {
                        existingExtraField.type = extraField.type;
                        existingExtraField.value = extraField.value;
                        existingExtraField.nameUnique = `${collectionItemId}_${extraField.name}`;

                        await existingExtraField.save();
                    } else {
                        await CollectionExtraField.create({
                            CollectionItemId: collectionItemId,
                            name: extraField.name,
                            type: extraField.type,
                            value: extraField.value,
                            nameUnique: `${collectionItemId}_${extraField.name}`,
                        });
                    }
                })
            );
        }
        const existingTagItems = await TagItem.findAll({
            where: {
                CollectionItemId: collectionItemId,
            }
        });
        const existingTagIds = existingTagItems.map((tagItem) => tagItem.TagId);
        const tagsToRemove = [];

        for (const tagItem of existingTagItems) {
            const tag = await Tag.findByPk(tagItem.TagId);
            if (!tags.includes(String(tag.name))) {
                tagsToRemove.push(tagItem);
            }
        }
        for (const tagItem of tagsToRemove) {
            await tagItem.destroy();
        }

        const existingTags = existingTagItems.map(async (tagItem) => {
            const tag = await Tag.findByPk(tagItem.TagId);
            return tag.name;
        });

        const tagsToAdd = tags.filter((tag) => !existingTags.includes(tag));

        for (const tagName of tagsToAdd) {
            const existingTag = await Tag.findOne({
                where: {
                    name: tagName,
                },
            });

            if (existingTag && !existingTagIds.includes(existingTag.id)) {
                await TagItem.create({
                    TagId: existingTag.id,
                    CollectionItemId: collectionItemId,
                });
            }
        }

        res.status(200).json({ message: 'CollectionItem updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


collectionItemsRouter.delete('/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;
        const collectionItem = await CollectionItem.findByPk(id);
        if (!collectionItem) {
            return res.status(404).json({message: 'CollectionItem not found'});
        }
        await collectionItem.destroy();
        res.json({message: 'CollectionItem deleted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

module.exports = collectionItemsRouter;
