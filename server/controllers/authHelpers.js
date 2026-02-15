const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken')
module.exports = {
    doSignup: async (req, res) => {
        try {
            if (req.body.password && req.body.password.length < 3) {
                return res.status(400).json({ success: false, message: "Password must be at least 3 characters long" });
            }

            req.body.password = await bcrypt.hash(req.body.password, 10);

            const { name, email, password, role } = req.body;

            const user = await User.create({
                name,
                email,
                password,
                role
            });
            console.log(user)
            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            console.log("token:" + token)

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            console.log(err)
            if (err.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Email already registered",
                });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
            console.log("Error occured during signup:" + err)
        }
    },
    doLogin: async (req, res) => {
        console.log(req.body)
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                success: true,
                token,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Login failed" });
        }
    },
};