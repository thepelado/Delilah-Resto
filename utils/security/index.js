const jwt = require('jsonwebtoken');
const secret = 'DelilahRestoDWFS';

const { findUserByUsername } = require('../users/index');

//Function that validate if user is admin or isn't
const isAdmin = (req, res, next) => {
    if (req.user.is_admin) {
        next();
    } else {
        res.status(403).send("Forbidden");
    }
}

//Function that return user logged data
const authUser = (req, res, next) => {
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
const validateCredentials = async (req, res) => {
    const { username, password } = req.body;
    try {
        const registeredUser = await findUserByUsername(username);
        if (registeredUser) {
            const { id, password: userPassword, is_admin, } = registeredUser;
            if (password === userPassword) {
                const token = jwt.sign({ id, username, is_admin }, secret, { expiresIn: '30m'});
                res.status(200).json(token);
            } else {
                res.status(400).json("Wrong password");
            }
        } else {
            res.status(400).json("Invalid Username");
        }
    } catch (error) {
        res.status(500).send(`ERROR: ${error}`);
    }
}

module.exports = { isAdmin, authUser, validateCredentials };