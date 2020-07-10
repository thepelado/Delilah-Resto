const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

//Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cors()); // evitar problemas CORS

//UTILS
const {    
    registerUser,
    validateExistingUser,
    getUsers,
    isAdmin,
    validateUser,
    validateCredentials,
    getOrders,
    registerOrder,
    updateOrderStatus,
    deleteOrder,
    getProducts,
    registerProduct,
    updateProduct,
    deleteProduct,
    validateExistingProduct
} = require("../utils");

app.get('/', (req, res) => {
    res.send('Menu');
});

//Users Routes
app.get('/users', validateUser, isAdmin, getUsers, (req, res) => {
    const list = req.usersList;
    res.status(200).json(list);
});

app.post("/users", validateExistingUser, registerUser, (req, res) => {
    res.status(201).json({ userId: req.createdUserId });
});

app.post('/users/login', validateCredentials, (req, res) => {
    res.status(200).json(req.jwtToken);
});

//Orders Routes
app.get('/orders', validateUser, getOrders, (req, res) => {
    const list = req.ordersList;
    res.status(200).json(list);
});

app.post('/orders', registerOrder, (req, res) => {
    res.status(201).json(req.createdOrder);
});

app.put('/orders/:orderId', validateUser, updateOrderStatus, (req, res) => {
    res.status(202).json(req.updatedOrder);
});

app.delete('/orders/:orderId', validateUser, deleteOrder, (req, res) => {
    res.status(204).json();
});

// PRODUCTS ENDOPINTS
app.get("/products", getProducts, (req, res) => {
    const list = req.productsList;
    res.status(200).json(list);
});
  
app.post("/products", validateUser, validateExistingProduct, registerProduct, (req, res) => {
    res.status(201).json({ productId: req.createdproductId });
});
  
app.put("/products/:productId", validateUser, updateProduct, (req, res) => {
    res.status(202).json(req.updatedProduct);
});
  
app.delete("/products/:productId", validateUser, deleteProduct, (req, res) => {
    res.status(204).json();
});

app.listen(3000, () => {
    console.log('Server is listening at port 3000');
});