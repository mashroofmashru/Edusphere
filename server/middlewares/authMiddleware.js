const jwt = require('jsonwebtoken');

module.exports = {
    verifyLogin: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ success: false, message: "No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            req.user = decoded;
            next();
        });
    },

    optionalAuth: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return next();
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;
            }
            next();
        });
    },

    verifyAdmin: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ success: false, message: "Require Admin Role" });
        }
    }
};
