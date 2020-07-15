//DATABASE
const { insertQuery, selectQuery, sequelize } = require("../../db");
const { updateQuery, deleteQuery } = require("../../db/queries");
const e = require("express");

async function findProductById(id) {
  const query = selectQuery("products", "*", `id = ${id}`);
  const [dbProduct] = await sequelize.query(query, { raw: true });
  const foundProduct = dbProduct[0];
  return foundProduct;
}

async function findProductByName(name) {
  const query = selectQuery("products", "*", `product_name = "${name}"`);
  const [dbProduct] = await sequelize.query(query, { raw: true });
  const foundProduct = dbProduct[0];
  return foundProduct;
}

async function validateExistingProduct(req, res, next) {
  const { product_name } = req.body;
  try {
    const existingProduct = await findProductByName(product_name);
    if (!existingProduct) {
      next();
    } else {
      console.log(existingProduct.id, req.params.productId);
      if (existingProduct.id === parseInt(req.params.productId))
      {
        next();
      }
      else
      {
        res.status(409).json("Product already exist");
      }
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function validateArgumentsProduct (req, res, next) {
  const { product_name, product_price, product_photo } = req.body;
  if ( product_name && product_price && product_photo) {
    next();
  } else {
    res.status(400).send("Missing Arguments");
  }
}

//Get Product
async function getProducts(req, res, next) {
  try {
    const query = selectQuery("products", "*", null, "id DESC");
    const [dbProducts] = await sequelize.query(query, { raw: true });
    res.status(200).json(dbProducts);
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

//Post Product
async function registerProduct(req, res) {
  const { product_name, product_price, product_photo } = req.body;
  try {
    const query = insertQuery("products",
    "product_name, product_price, product_photo",
      [
        product_name,
        product_price,
        product_photo
      ]
    );
    [productId] = await sequelize.query(query, { raw: true });
    res.status(201).json({ productId: productId });
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

//Update Product
async function updateProduct(req, res, next) {
  const id = req.params.productId;
  const {
    product_name,
    product_price,
    product_photo
  } = req.body;
  try {
    const query = updateQuery("products",
    `product_name = '${product_name}', product_photo = '${product_photo}', product_price = '${product_price}'`,
    `id = ${id}`
    );
    [productId] = await sequelize.query(query, { raw: true });
    const updatedProduct = await findProductById(id);
    res.status(202).json(updatedProduct);
  } catch (err) {
    res.status(500).send(`ERROR: ${error}`);
  }  
}

//Delete Product
async function deleteProduct(req, res) {
  try {
    const id = req.params.productId;
    const productToDelete = await findProductById(id);
    if (productToDelete)
    {
      const query = deleteQuery("products", `id = ${id}`);
      await sequelize.query(query, { raw: true });
      res.status(204).json();
    } else {
      res.status(404).json("Product not found");
    }
  } catch (error) {
    res.status(500).send(`ERROR: ${error}`);
  }
}

module.exports = {
  findProductById,
  getProducts,
  registerProduct,
  updateProduct,
  deleteProduct,
  validateExistingProduct,
  validateArgumentsProduct
};