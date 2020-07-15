//DATABASE
const {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  sequelize,
  updateQuery,
} = require("../../db");

const { findUserByUsername } = require('../users/');
const { findProductById } = require('../products/');
const statusArray = [
  "new",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
];

//Return only head of the order
async function findOrderById(orderId) {
  const query = selectQuery("orders", "*", `id = ${orderId}`);
  const [dbOrder] = await sequelize.query(query, { raw: true });
  return dbOrder;
}

//Return the object full (head + details)
async function findFullOrderById(orderId) {
  const ordersQuery = joinQuery(
    "orders",
    "orders.*, users.username, users.firstname, users.lastname,users.address, users.email, users.phone_number",
    ["users ON orders.user_id = users.id"],
    `orders.id = ${orderId}`
  );
  const [orderInfo] = await sequelize.query(ordersQuery, { raw: true });
  let order = orderInfo[0];
  const ordersProductsQuery = joinQuery(
    "orders_products",
    "orders_products.product_quantity, products.product_name, products.product_price, products.product_photo",
    ["products ON orders_products.product_id = products.id"],
    `order_id = ${orderId}`
  );
  const [orderDetailInfo] = await sequelize.query(ordersProductsQuery, { raw: false });
  order.products = orderDetailInfo;
  return order;
}

//Insert Order Head
async function createOrderHead(orderTime, orderDesc, totalPrice, payment_method, user_id)
{
  const query = insertQuery(
    "orders",
    "order_time, order_description, order_amount, payment_method, user_id",
    [orderTime, orderDesc, totalPrice, payment_method, user_id]
  );
  const [orderId] = await sequelize.query(query, { raw: true });
  return orderId;
}

//Insert Order Details
async function createOrderDetails(orderId, products)
{
  //Create the order details
  await sequelize.query(
    `INSERT INTO delilah_resto.orders_products (order_id, product_id, product_quantity) 
    VALUES ${products.map(product => `(${orderId}, ${product.productId}, ${product.quantity})`).join(',')};`,
    {
       replacements: products,
       type: sequelize.QueryTypes.INSERT
    }
  ); 
}

//Make the product's details and the total for the order head
async function obtainOrderProductsDetails(products) {
  let orderDescription = "";
  let subtotal = 0;
  for (let i = 0; i < products.length; i++) {
    const product = await findProductById(products[i].productId);
    orderDescription += `${products[i].quantity}x ${product.product_name} `;
    subtotal += products[i].quantity * product.product_price;
  }
  return [orderDescription, subtotal];
}

//Validate arguments for Post Order
async function validateArgumentsOrder(req, res, next)
{
  const { username, products, payment_method } = req.body;
  if (username && products && payment_method) {
    const userData = await findUserByUsername(username);
    if (userData) {
      req.userData = userData;
      next();
    } else {
      res.status(400).json("User not found");
    }
  } else {
    res.status(405).json("Missing Arguments");
  }
}

//Get Orders Function
async function getOrders(req, res) {
  try {
    const query = (req.user.is_admin) ? selectQuery("orders", "id", null, "order_time DESC") : selectQuery("orders", "id", `orders.user_id = ${req.user.id}`, "order_time DESC");
    const [dbOrders] = await sequelize.query(query, { raw: true });
    let orders = [];
    for (let i = 0; i < dbOrders.length; i++) {
      let order = await findFullOrderById(dbOrders[i].id);
      await orders.push(order);
    };
    res.status(200).json(orders);
  }
  catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

//Post Function
async function registerOrder(req, res) {
  try {
    const { products, payment_method } = req.body;
    const userId = req.userData.id;
    const orderTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [orderDesc, totalPrice] = await obtainOrderProductsDetails(products);
    //Create the order and, after, the details
    const orderId = await createOrderHead(orderTime, orderDesc, totalPrice, payment_method, userId);
    await createOrderDetails(orderId, products);
    //Make the object for the response
    res.status(201).json(await findFullOrderById(orderId));
  }
  catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

//Update Function
async function updateOrderStatus(req, res) {
  const id = req.params.orderId;
  const { status:newStatus } = req.body;
  if (statusArray.find( (status) => status === newStatus)) {
    try {
      const orderToUpdate = await findOrderById(id);
      if (orderToUpdate && orderToUpdate.length > 0) {
        const query = updateQuery(
          "orders",
          `order_status = '${newStatus}'`,
          `id = ${id}`
        );
        await sequelize.query(query, { raw: true });
        res.status(202).json(await findOrderById(id));
      } else {
        res.status(404).json("Order not found");
      }      
    } catch (err) {
      res.status(500).send(`ERROR: ${error}`);
    }
  } else {
    res.status(405).json("Invalid status suplied");
  }
}

//Delete Function
async function deleteOrder(req, res) {
  const id = +req.params.orderId;
  try {
    const orderToDelete = await findOrderById(id);
    if (orderToDelete) {
      const query = deleteQuery("orders", `id = ${id}`);
      await sequelize.query(query, { raw: true });
      res.status(204).json();
    } else {
      res.status(404).json("Order not found");
    }
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

module.exports = {
  registerOrder,
  validateArgumentsOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
};