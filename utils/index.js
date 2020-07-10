//Levanto las funciones de cada modulo
const {
  isAdmin,
  validateUser,
  validateCredentials
} = require("./security");

const {
    findUserByName,
    findUserByUsername,
    getUsers,
    registerUser,
    validateExistingUser,
} = require("./users");

const {
    findOrderById,
    registerOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
} = require("./orders");

const {
  findProductById,
  getProducts,
  registerProduct,
  updateProduct,
  deleteProduct,
  validateExistingProduct
} = require("./products");

module.exports = {
  deleteOrder,
  deleteProduct,
  findOrderById,
  findProductById,
  findUserByName,
  findUserByUsername,
  getOrders,
  getProducts,
  getUsers,
  updateOrderStatus,
  updateProduct,
  registerOrder,
  registerProduct,
  registerUser,
  validateExistingUser,
  isAdmin,
  validateExistingProduct,
  validateUser,
  validateCredentials,  
};