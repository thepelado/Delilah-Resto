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
  const query = selectQuery("orders", "*", `order_id = ${orderId}`);
  const [dbOrder] = await sequelize.query(query, { raw: true });
  const foundOrder = await dbOrder.find(
    (element) => element.order_id === orderId
  );
  return foundOrder;
}

//Return the object full (head + details)
async function findFullOrderById(orderId) {
  const ordersQuery = joinQuery(
    "orders",
    "orders.*, users.username, users.firstname, users.lastname,users.address, users.email, users.phone_number",
    ["users ON orders.user_id = users.user_id"],
    `order_id = ${orderId}`
  );
  const [orderInfo] = await sequelize.query(ordersQuery, { raw: true });
  if (orderInfo[0].order_id)
  {
    const order = orderInfo[0];
    const ordersProductsQuery = joinQuery(
      "orders_products",
      "orders_products.product_quantity, products.product_name, products.product_price, products.product_photo",
      ["products ON orders_products.product_id = products.product_id"],
      `order_id = ${orderId}`
    );
    const [orderDetailInfo] = await sequelize.query(ordersProductsQuery, { raw: true });
    order.products = await orderDetailInfo;
    return await order;
  }  
}

//Insert Order
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

//Insert Order details
async function createOrderDetails(orderId, products)
{
  //Create the order details
  products.forEach(async (product) => {
    const { productId, quantity } = product;
    const query = insertQuery(
      "orders_products",
      "order_id, product_id, product_quantity",
      [orderId, productId, quantity]
    );
    await sequelize.query(query, { raw: true });
  });
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

async function getOrders(req, res, next) {
  try {
    const query = (req.user.is_admin) ? selectQuery("orders", "order_id", null, "order_time DESC") : selectQuery("orders", "order_id", `orders.user_id = ${req.user.user_id}`, "order_time DESC");
    console.log(query);
    const [dbOrders] = await sequelize.query(query, { raw: true });
    if (dbOrders && dbOrders.length > 0)
    {
      let orders = [];
      for (let i = 0; i < dbOrders.length; i++) {
        let order = await findFullOrderById(dbOrders[i].order_id);
        await orders.push(order);
      };
      req.ordersList = orders;
      next();
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function registerOrder(req, res, next) {
  const { username, products, payment_method } = req.body;
  if (username && products && payment_method) {
    const userData = await findUserByUsername(username);
    if (userData) {
      //Get the params for create the order
      const userId = userData.user_id;
      const orderTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const [orderDesc, totalPrice] = await obtainOrderProductsDetails(products);
      //Create the order and, after, the details
      const orderId = await createOrderHead(orderTime, orderDesc, totalPrice, payment_method, userId);
      await createOrderDetails(orderId, products);
      //Make the object for the response
      req.createdOrder = await findFullOrderById(orderId);
      next();
    } else {
      res.status(400).json("User not found");
    }
  } else {
    res.status(405).json("Missing Arguments");
  }
}

async function updateOrderStatus(req, res, next) {
  const id = +req.params.orderId;
  const { status:newStatus } = req.body;
  const validStatus = statusArray.find( (status) => status === newStatus);
  if (validStatus) {
    try {
      const orderToUpdate = await findOrderById(id);
      if (orderToUpdate) {
        const query = updateQuery(
          "orders",
          `order_status = '${newStatus}'`,
          `order_id = ${id}`
        );
        await sequelize.query(query, { raw: true });
        req.updatedOrder = await findOrderById(id);
      } else {
        res.status(404).json("Order not found");
      }
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(405).json("Invalid status suplied");
  }
}

async function deleteOrder(req, res, next) {
  const id = +req.params.orderId;
  try {
    const orderToDelete = await findOrderById(id);
    if (orderToDelete) {
      const query = deleteQuery(
        "orders",
        `order_id = ${id}`
      );
      await sequelize.query(query, { raw: true });
    } else {
      res.status(404).json("Order not found");
    }
    next();
  } catch (err) {
    next(new Error(err));
  }
}

module.exports = {
  findOrderById,
  findFullOrderById,
  registerOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
};