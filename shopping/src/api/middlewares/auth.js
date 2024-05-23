const { ValidateSignature } = require('../../utils');

module.exports = async (req, res, next) => {
    try {
        const isAuthorized = await ValidateSignature(req);

        if (isAuthorized) {
            return next();
        } else {
            return res.status(403).json({ message: 'Not Authorized' });
        }
    } catch (error) {
        console.error("Error in authorization middleware:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
