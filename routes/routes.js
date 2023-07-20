const express = require("express");
const sequelize = require('../sequelize');
const { Op } = require('sequelize');
const {User, Collection, CollectionItem, Tag, Topic, CollectionExtraField, TagItem, Like, Comment} = require('../models/model');
const verifyToken = require("../middlewares/tokenMiddleware");
const {Topics} = require("../models/constants");

router = express.Router();


router.get('/users', verifyToken, async (req, res) => {
    try {
        // Example query using Sequelize
        const users = await User.findAll({
            attributes: {exclude: ['password']},
        });
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/users/status", verifyToken, async (req, res) => {
    try {
        const {status, userId} = req.body;
        console.log(req.user)
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.status = status ? 'active' : 'blocked'
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

router.post("/users/role", verifyToken, async (req, res) => {
    try {
        const {role, userId} = req.body;
        console.log(req.user)
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.is_admin = role;
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

router.delete("/users/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        await user.destroy();
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/topics', async (req, res) => {
    try {
        const topics = [...Topics];
        topics.forEach(topic=>{
            topic.name = topic[`name_${req.language}`]
        })
        res.json(topics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/tags', async (req, res) => {
    try {
        const tags = await Tag.findAll();
        res.json(tags);
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.get('/tags/:id', async (req, res)=>{try {
    // Find all TagItems with the given TagId
    const {id} = req.params
    const userId = req.query.userId;
    const tagItemss = await TagItem.findAll({
        where: {
            TagId: id,
        },
        include: [{ model: CollectionItem, as: 'collectionItem' }],
    });

    if (!tagItemss || tagItemss.length === 0) {
        return res.status(404).json({ message: 'No CollectionItems found for the specified TagId' });
    }

    // Extract the associated CollectionItems from the tagItems array
    const collectionItems = await Promise.all(tagItemss.map(async (tagItem) => {
        return await CollectionItem.findByPk(tagItem.CollectionItemId)
    }));
    console.log("CollectionItemss", collectionItems)
    const collectionWithLikes = await Promise.all(collectionItems?.map(async (collectionItem) =>{
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
        const attributeName = `name_${req.language}`;
        const translatedName = collectionItem.get(attributeName);
        const comments = await Comment.findAll({
            where: {
                CollectionItemId: collectionItem.id,
            },
        });
        return {
            ...collectionItem.toJSON(),
            tags,
            like,
            name: translatedName,
            comments: comments.length,
        }
    }))
    res.json(collectionWithLikes);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
})

router.post('/likes', verifyToken, async (req, res) => {
    try {
        const {value, collectionItemId} = req.body;
        const userId = req.user.userId;
        // Create the Like record
        const like = await Like.create({
            value,
            CollectionItemId: collectionItemId,
            UserId: userId,
        });

        // Retrieve the associated CollectionItem and User
        const collectionItem = await CollectionItem.findByPk(collectionItemId);
        const user = await User.findByPk(userId);

        // Associate the Like with the CollectionItem and User
        await like.setCollectionItem(collectionItem);
        await like.setUser(user);

        res.status(201).json({message: 'Like created successfully', like});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

router.put('/likes/:id', verifyToken, async (req, res) => {
    try {
        const likeId = req.params.id;
        const {value, collectionItemId} = req.body;
        const userId = req.user.userId;

        const like = await Like.findByPk(likeId);
        if (!like) {
            return res.status(404).json({message: 'Like not found'});
        }

        like.value = value;
        await like.save();

        const collectionItem = await CollectionItem.findByPk(collectionItemId);
        const user = await User.findByPk(userId);

        await like.setCollectionItem(collectionItem);
        await like.setUser(user);

        user.Like = like;

        res.status(200).json({message: 'Like updated successfully', like, user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

router.delete('/likes/:id', async (req, res) => {
    try {
        const likeId = req.params.id;

        // Find the Like record
        const like = await Like.findByPk(likeId);
        if (!like) {
            return res.status(404).json({message: 'Like not found'});
        }

        // Delete the Like record
        await like.destroy();

        res.status(200).json({message: 'Like deleted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.get('/users/:id', verifyToken, async (req, res) => {
    try {
        const {id} = req.params;

        const user = await User.findByPk(id)
        if (!user) {
            return res.status(401).json({error: "User not found"})
        }
        const userWithoutPassword = { ...user.toJSON() };
        delete userWithoutPassword.password;
        res.json({
            user: userWithoutPassword
        })
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

const modelsToSearch = [Collection, CollectionItem, Tag, Topic, Comment];

// Create the search endpoint
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) {
            return res.status(400).json({ message: 'Search term not provided' });
        }

        const searchResults = await Promise.all(
            modelsToSearch.map(async (model) => {
                const attributes = Object.keys(model.rawAttributes);
                const where = {
                    [Op.or]: attributes.map((attribute) => ({
                        [attribute]: {
                            [Op.like]: `%${searchTerm}%`,
                        },
                    })),
                };
                const results = await model.findAll({
                    where,
                });
                return { modelName: model.name, results };
            })
        );

        res.json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, password, status, is_admin } = req.body;
        console.log("req.body: ", req.body)
        const newUser = await User.create({
            name,
            email,
            password,
            status: status || 'active',
            is_admin: is_admin || false,
        });
        const userWithoutPassword = { ...newUser.toJSON() };
        delete userWithoutPassword.password;

        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
