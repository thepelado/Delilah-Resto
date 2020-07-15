//Levanto las funciones de cada modulo
const {
  isAdmin,
  authUser,
  validateCredentials
} = require("./security");

const {
    getUsers,
    registerUser,
    validateExistingUser,
    validateArgumentsUser
} = require("./users");

const {
    registerOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder,
    validateArgumentsOrder
} = require("./orders");

const {
  findProductById,
  getProducts,
  registerProduct,
  updateProduct,
  deleteProduct,
  validateExistingProduct,
  validateArgumentsProduct
} = require("./products");

module.exports = {
  deleteOrder,
  deleteProduct,
  findProductById,
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
  authUser,
  validateCredentials,
  validateArgumentsOrder,
  validateArgumentsUser,
  validateArgumentsProduct
};