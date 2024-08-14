exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ error: 'Access denied. Users only.' });
    }
    next();
};
