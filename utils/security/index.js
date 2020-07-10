const jwt = require('jsonwebtoken');
const secret = 'DelilahRestoDWFS';

const { findUserByUsername } = require('../users/index');

//Function that validate if user is admin or isn't
const isAdmin = (req, res, next) => {
    const is_admin = req.user.is_admin;
    if (is_admin) {
        req.is_admin = is_admin;
        next();
    } else {
        res.status(403).send("Forbidden");
    }
}

//Function that return user logged data
const validateUser = (req, res, next) => {
    try {
        if (!req.headers.authorization)
        {
            res.status(403).send("Forbidden");
        }
        const token = req.headers.authorization.split(' ')[1];
        const verificarToken = jwt.verify(token, secret);
        req.user = verificarToken;
        next();
    } catch (error) {
        res.status(404).json(error);
    }
}

//Function for login route
const validateCredentials = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const registeredUser = await findUserByUsername(username);
        if (registeredUser) {
            const { user_id, password: userPassword, is_admin, } = registeredUser;
            if (password === userPassword) {
                const token = jwt.sign({ user_id, username, is_admin }, secret);
                req.jwtToken = token;
                next();
            } else {
                res.status(400).json("Wrong password");
            }
        } else {
            res.status(400).json("Invalid Username");
        }
    } catch (err) {
        next(new Error(err));
    }
}

module.exports = { isAdmin, validateUser, validateCredentials };