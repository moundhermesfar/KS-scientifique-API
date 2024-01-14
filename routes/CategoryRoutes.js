const express = require("express");
const Category = require("../Models/CategoryModel.js");
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
  "/create-category",
  upload.single("file"),
  async (request, response) => {
    try {
      if (!request.body.name || !request.body.img) {
        return response.status(400).send({
          message: "Send all required fields: name, img",
        });
      }

      const newCategory = {
        name: request.body.name,
        img: {
          data: Buffer.from(request.body.img, "base64"),
          contentType: "image/png",
        },
      };

      const category = await Category.create(newCategory);

      return response.status(201).send(category);
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  }
);

router.get("/get-categories", async (request, response) => {
  try {
    const categories = await Category.find({});

    const categoriesWithBase64 = categories.map((category) => {
      return {
        ...category._doc,
        img: {
          ...category._doc.img,
          data: category.img.data.toString("base64"),
        },
      };
    });

    return response.status(200).json({
      count: categories.length,
      data: categoriesWithBase64,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/get-category/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const category = await Category.findById(id);

    return response.status(200).json(category);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.put(
  "/update-category/:id",
  upload.single("file"),
  async (request, response) => {
    try {
      const { id } = request.params;
      const existingCategory = await Category.findById(id);

      if (!existingCategory) {
        return response.status(404).json({ message: "Category not found" });
      }

      existingCategory.name = request.body.name;

      if (request.file) {
        existingCategory.img = {
          data: Buffer.from(request.body.img, "base64"),
          contentType: "image/png",
        };
      }

      const updatedCategory = await existingCategory.save();

      return response.status(200).json({
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      console.error(error.message);
      response.status(500).send({ message: "Internal Server Error" });
    }
  }
);

router.delete("/delete-category:id", async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Category.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: "category not found" });
    }

    return response
      .status(200)
      .send({ message: "category deleted successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

module.exports = router;
