//DATABASE
const { insertQuery, selectQuery, sequelize } = require("../../db");
const { updateQuery, deleteQuery } = require("../../db/queries");

async function findProductById(id) {
  const query = selectQuery("products", "*", `product_id = ${id}`);
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
      if (existingProduct.product_id === req.params.productId)
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

async function getProducts(req, res, next) {
  try {
    const query = selectQuery("products", "*", null, "product_id DESC");
    const [dbProducts] = await sequelize.query(query, { raw: true });
    if (dbProducts && dbProducts.length > 0)
    {
      req.productsList = dbProducts;
      next();
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function registerProduct(req, res, next) {
  const {
    product_name,
    product_price,
    product_photo
  } = req.body;
  if (
    product_name &&
    product_price &&
    product_photo
  ) {
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
      req.createdproductId = productId;
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(400).json("Missing Arguments");
  }
}

async function updateProduct(req, res, next) {
  const id = req.params.productId;
  const {
    product_name,
    product_price,
    product_photo
  } = req.body;
  if (
    product_name &&
    product_price &&
    product_photo
  ) {
    try {
      const query = updateQuery("products",
      `product_name = '${product_name}', product_photo = '${product_photo}', product_price = '${product_price}'`,
      `product_id = ${id}`
      );
      [productId] = await sequelize.query(query, { raw: true });
      req.updatedProduct = await findProductById(id);
    } catch (err) {
      next(new Error(err));
    }
    next();
  } else {
    res.status(400).json("Missing Arguments");
  }
}

async function deleteProduct(req, res, next) {
  const id = req.params.productId;
  try {
    const productToDelete = await findProductById(id);
    if (productToDelete)
    {
      const query = deleteQuery("products",
        `product_id = ${id}`
        );
      await sequelize.query(query, { raw: true });
    } else {
      res.status(404).json("Product not found");
    }
    next();
  } catch (err) {
    next(new Error(err));
  }
}

module.exports = {
  findProductById,
  getProducts,
  registerProduct,
  updateProduct,
  deleteProduct,
  validateExistingProduct
};