const languageMiddleware = (req, res, next) => {
    // Get token from the Authorization header
    const acceptLanguageHeader = req.headers['accept-language'];
    const primaryLanguageCode = acceptLanguageHeader ? acceptLanguageHeader.split('-')[0] : 'en';
    // Check if the Authorization header exists
    try {
        req.language = primaryLanguageCode; // Add the user information to the request object
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = languageMiddleware
