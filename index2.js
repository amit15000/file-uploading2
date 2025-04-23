import express from "express";
import { MongoClient } from "mongodb";
import multer from "multer";
import pLimit from "p-limit";
import sharp from "sharp";
const app = express();

const mongoClient = new MongoClient("mongodb://localhost:27017/Amit");
await mongoClient.connect().then(() => {
  console.log("DB Connected");
});

const db = mongoClient.db("fileUpload2");
const imageCollection = db.collection("images");

const upload = multer(multer.memoryStorage());

app.post("/upload-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length == 0) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const limit = pLimit(3);

    const processedImages = await Promise.all(
      files.map((file) =>
        limit(async () => {
          const resizedBuffer = await sharp(file.buffer)
            .resize(1024, 1024)
            .toFormat("jpeg")
            .toBuffer();

          const result = await imageCollection.insertOne({
            filename: file.originalname,
            contentType: file.mimetype,
            image: resizedBuffer,
          });

          return { id: result.insertedId };
        })
      )
    );
    res.status(200).json({
      message: "image resized and uploaded",
      images: processedImages,
    });
  } catch (error) {}
});

app.get("/images", async (req, res) => {
  try {
    const imageDoc = await imageCollection.findOne({});
    console.log(imageDoc);
    if (!imageDoc) {
      res.status(404).json({
        error: "Image not found",
      });
    }
    res.set(
      "Content-Disposition",
      ` attachment; filename="${imageDoc.filename}"`
    );
    // res.send(imageDoc.image.buffer); // assuming `imageDoc.buffer` is a Buffer
    res.send(imageDoc.image.buffer);
  } catch (err) {
    console.error("Failed to retrieve image:", err);
    res.status(500).json({ error: "Failed to retrieve image" });
  }
});

app.listen(3000, () => {
  console.log("Server is running at 3000");
});
