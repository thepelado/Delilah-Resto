//DATABASE
const { insertQuery, selectQuery, sequelize } = require("../../db");

async function findUserByEmail(email) {
  const query = selectQuery("users", "*", `email = '${email}'`);
  const [dbUser] = await sequelize.query(query, { raw: true });
  const existingUser = await dbUser.find(
    (element) => element.email === email);
  return existingUser ? true : false;
}

async function findUserByUsername(username) {
  const query = selectQuery(
    "users",
    "id, username, password, is_admin",
    `username = '${username}'`
  );
  const [dbUser] = await sequelize.query(query, { raw: true });
  const foundUser = dbUser[0];
  return foundUser;
}

async function validateArgumentsUser(req, res, next) {
  const { username, password, firstname, lastname, address, email, phone_number, is_admin } = req.body;
  if ( username && password && firstname && lastname && address && email && phone_number)
  {
    next();
  } else {
    res.status(400).json("Missing Arguments");
  }
}

async function validateExistingUser(req, res, next) {
  const { email, username } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      const dbUsers = await findUserByUsername(username);
      if (!dbUsers) {
        next();
      } else {
        res.status(409).json("Username already exists");
      }
    } else {
      res.status(409).json("Email already in use");
    }
  } catch (err) {
    next(new Error(err));
  }
}

//Get Users
async function getUsers(req, res, next) {
  try {
    const query = selectQuery("users");
    const [dbUsers] = await sequelize.query(query, { raw: true });
    res.status(200).json(dbUsers);
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

//Post User Function
async function registerUser(req, res) {
  try {
    const { username, password, firstname, lastname, address, email, phone_number, is_admin } = req.body;
    const query = insertQuery(
      "users",
      "username, password, firstname, lastname, address, email, phone_number, is_admin",
      [
        username,
        password,
        firstname,
        lastname,
        address,
        email,
        phone_number,
        is_admin,
      ]
    );
    const [userId] = await sequelize.query(query, { raw: true });
    res.status(201).json({ userId });
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

module.exports = {
  findUserByUsername,
  getUsers,
  registerUser,
  validateExistingUser,
  validateArgumentsUser
};