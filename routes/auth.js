const express = require("express");
const sequelize = require('../sequelize');
const jwt = require('jsonwebtoken');
const {User} = require('../models/model');

authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user with the same email already exists
        const existingUser = await User.findOne({ where: { email } });

        // If the user already exists, return an error
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Create a new user in the database
        const newUser = await User.create({
            name,
            email,
            password,
        });

        const token = jwt.sign({ userId: newUser.id }, 'course_project', { expiresIn: '3d' })

        // Return the newly created user in the response
        res.json({ user: newUser, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        // If the user does not exist, return an error
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the entered password with the hashed password
        const isPasswordValid = await user.comparePassword(password);

        // If the password is invalid, return an error
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userWithoutPassword = { ...user.toJSON() };
        delete userWithoutPassword.password;

        // Password is valid, generate a JWT token
        const token = jwt.sign({ userId: user.id }, 'course_project', { expiresIn: '3d' });
        res.json({ token, user: userWithoutPassword, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});


module.exports = authRouter;
