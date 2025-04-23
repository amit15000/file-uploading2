// index.js
const express = require("express");
const multer = require("multer");
const { default: slugify } = require("slugify");
const app = express();
const path = require("path");
const sharp = require("sharp");
// Set up storage

const storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.parse(file.originalname).name;
    const clearName = slugify(name, {
      lower: true,
      strict: true,
    });
    cb(null, `${Date.now()}-${clearName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("only iamges are allowed"), false);
  }
};

// Set up multer
const upload = multer({ storage, fileFilter });

//upload single file
app.post("/upload", upload.single("profile"), (req, res) => {
  res.send("Uploaded!");
});

//upload multiple
app.post("/upload-mutiple", upload.array("photos"), (req, res) => {
  console.log(req.files);

  res.send("Mutiple files uploaded");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
