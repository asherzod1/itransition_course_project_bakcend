const express = require("express");
const sequelize = require('./sequelize');
const {User, Message} = require('./models/model');

router = express.Router();

router.post('/users', async (req, res) => {
    try {
        const { name } = req.body
        const user = await User.findOne({ where: { name } });
        if(user){
            return res.json(user)
        }
        const new_user = await User.create({ name, createdAt: new Date(), updatedAt: new Date() })
        res.json(new_user)
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.get('/users', async (req, res) => {
    try {
        // Example query using Sequelize
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/message', async (req, res) => {
    try {
        const { text, title, recipientId, authorId } = req.body
        const user = await User.findOne({ where: { name: recipientId } });
        if (user){
            const new_message = await Message.create({ text, title, recipientId: user.id, authorId })
            return res.json(new_message)
        }
        const new_user = await User.create({ name: recipientId, createdAt: new Date(), updatedAt: new Date() })
        const new_message = await Message.create({ text, title, recipientId:new_user.id, authorId })
        res.json(new_message)
    }
    catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/users/:id', async (req, res) =>{
    try {
        const {id} = req.params;

        const user = await User.findByPk(id)
        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        const messages = await Message.findAll({
            where: { recipientId: id },
            include: [{ model: User, as: 'author' }],
        });

        res.json({
            user: user,
            messages: messages
        })
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



module.exports = router;
