const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const server = express();

//Middlewares
server.use(bodyParser.urlencoded({ extended: false })); // parse serverlication/x-www-form-urlencoded
server.use(bodyParser.json()); // parse serverlication/json
server.use(cors()); // evitar problemas CORS

//UTILS
const {    
    registerUser,
    validateExistingUser,
    getUsers,
    isAdmin,
    authUser,
    validateCredentials,
    getOrders,
    registerOrder,
    updateOrderStatus,
    deleteOrder,
    getProducts,
    registerProduct,
    updateProduct,
    deleteProduct,
    validateExistingProduct,
    validateArgumentsProduct,
    validateArgumentsOrder,
    validateArgumentsUser
} = require("../utils");

server.get('/', (req, res) => {
    res.send('Menu');
});

//Users Routes
server.get('/users', authUser, isAdmin, getUsers);
server.post("/users", validateArgumentsUser, validateExistingUser, registerUser);
server.post('/users/login', validateCredentials);

// PRODUCTS ENDOPINTS
server.get("/products", getProducts);  
server.post("/products", authUser, isAdmin, validateArgumentsProduct, validateExistingProduct, registerProduct);
server.put("/products/:productId", authUser, isAdmin, validateArgumentsProduct, validateExistingProduct, updateProduct);
server.delete("/products/:productId", authUser, isAdmin, deleteProduct);

//Orders Routes
server.get('/orders', authUser, getOrders);
server.post('/orders', validateArgumentsOrder, registerOrder);
server.put('/orders/:orderId', authUser, isAdmin, updateOrderStatus);
server.delete('/orders/:orderId', authUser, isAdmin, deleteOrder);


server.listen(3000, () => {
    console.log('Server is listening at port 3000');
});