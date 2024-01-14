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

router.post(
  "/create-product",
  upload.single("file"),
  async (request, response) => {
    try {
      if (
        !request.body.name ||
        !request.body.category ||
        !request.body.description ||
        !request.body.price ||
        !request.body.img
      ) {
        return response.status(400).send({
          message:
            "Send all required fields: name, category, description, price, img",
        });
      }

      const newProduct = {
        name: request.body.name,
        category: request.body.category,
        description: request.body.description,
        price: request.body.price,
        img: {
          data: Buffer.from(request.body.img, "base64"),
          contentType: "image/jpeg",
        },
      };

      const product = await Product.create(newProduct);

      return response.status(201).send(product);
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
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

// router.get("/get-products/:id", async (request, response) => {
//   try {
//     const { id } = request.params;

//     const product = await Product.findById(id);

//     return response.status(200).json(product);
//   } catch (error) {
//     console.log(error.message);
//     response.status(500).send({ message: error.message });
//   }
// });

router.put("/:id", async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.description ||
      !request.body.img ||
      !request.body.price ||
      !request.body.category
    ) {
      return response.status(400).send({
        message:
          "Send all required fields: name, description, img, price, category",
      });
    }

    const { id } = request.params;

    const result = await Product.findByIdAndUpdate(
      id,
      {
        name: request.body.name,
        description: request.body.description,
        img: {
          data: Buffer.from(request.body.img, "base64"),
          contentType: "image/jpeg",
        },
        price: request.body.price,
        category: request.body.category,
      },
      { new: true }
    );

    if (!result) {
      return response.status(404).json({ message: "product not found" });
    }

    return response
      .status(200)
      .send({ message: "product updated successfully" });
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
