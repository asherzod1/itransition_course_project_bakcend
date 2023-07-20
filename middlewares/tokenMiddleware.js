const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    const language = req.headers.language;

    // Check if the Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        // Extract the token from the Authorization header
        const token = authHeader.split(' ')[1];

        // Verify the token and extract the payload
        const decoded = jwt.verify(token, 'course_project');
        req.user = decoded; // Add the user information to the request object
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};



module.exports = verifyToken
