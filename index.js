require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const CategoryRoutes = require("./routes/CategoryRoutes.js");
const ProductRoutes = require("./routes/ProductRoutes.js");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// const corsOptions = {
//   origin: "https://ks-scientifique.onrender.com",
// };

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("welcome");
});

app.use("/admin/categories", CategoryRoutes);
app.use("/admin/products", ProductRoutes);

mongoose
  .connect(process.env.DBURL)
  .then(() => {
    console.log("App connected to DB");
    app.listen(PORT, () => {
      console.log(`listning on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
