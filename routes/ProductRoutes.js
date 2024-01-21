const express = require("express");
const Product = require("../Models/ProductModel.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/create-product", upload.array("files", 3), async (req, res) => {
  try {
    const { name, category, description, price } = req.body;
    const images = req.files.map((file) => ({
      data: Buffer.from(file.buffer, "base64"),
      contentType: file.mimetype,
    }));

    if (!name || !category || !description || !price || images.length === 0) {
      return res.status(400).send({
        message:
          "Send all required fields: name, category, description, price, files",
      });
    }

    const newProduct = {
      name,
      category,
      description,
      price,
      img1: images[0],
      img2: images[1],
      img3: images[2],
    };

    const product = await Product.create(newProduct);

    return res.status(201).send(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.put(
  "/update-product/:id",
  upload.array("files", 3),
  async (req, res) => {
    try {
      const { id } = req.params;
      const existingProduct = await Product.findById(id);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      existingProduct.name = req.body.name;
      existingProduct.description = req.body.description;
      existingProduct.price = req.body.price;
      existingProduct.category = req.body.category;

      if (req.files) {
        const images = req.files.map((file) => ({
          data: Buffer.from(file.buffer, "base64"),
          contentType: file.mimetype,
        }));

        existingProduct.img1 = images[0] || existingProduct.img1;
        existingProduct.img2 = images[1] || existingProduct.img2;
        existingProduct.img3 = images[2] || existingProduct.img3;
      }

      const updatedProduct = await existingProduct.save();

      return res.status(200).json({
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
);

router.get("/get-products", async (request, response) => {
  try {
    const products = await Product.find({});

    const productsWithBase64 = products.map((product) => {
      return {
        ...product._doc,
        img: {
          ...product._doc.img,
          data: product.img.data.toString("base64"),
        },
      };
    });
    return response.status(200).json({
      count: products.length,
      data: productsWithBase64,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/get-product/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const product = await Product.findById(id);

    return response.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.delete("/delete-product/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Product.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: "product not found" });
    }

    return response
      .status(200)
      .send({ message: "product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/products-by-category/:category", async (request, response) => {
  try {
    const { category } = request.params;
    const products = await Product.find({ category });

    return response.status(200).json(products);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

module.exports = router;
