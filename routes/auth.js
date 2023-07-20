const express = require("express");
const sequelize = require('../sequelize');
const jwt = require('jsonwebtoken');
const {User} = require('../models/model');

authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        const newUser = await User.create({
            name,
            email,
            password,
        });

        const token = jwt.sign({ userId: newUser.id }, 'course_project', { expiresIn: '3d' })

        res.json({ user: newUser, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if(user.status !== 'active'){
            return res.status(401).json({ error: 'User blocked' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userWithoutPassword = { ...user.toJSON() };
        delete userWithoutPassword.password;

        const token = jwt.sign({ userId: user.id }, 'course_project', { expiresIn: '3d' });
        res.json({ token, user: userWithoutPassword, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});


module.exports = authRouter;
