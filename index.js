import express from "express";
import multer from "multer";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import pLimit from "p-limit";

import { ObjectId } from "mongodb";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const mongoClient = new MongoClient("mongodb://localhost:27017/Amit");
await mongoClient.connect().then(() => {
  console.log("Connected to the database");
});
const db = mongoClient.db("fileUpload");
const imagesCollection = db.collection("images");

app.post("/upload-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    const limit = pLimit(3); // 🔄 Process max 3 images in parallel

    const processedImages = await Promise.all(
      files.map((file) =>
        limit(async () => {
          const resizedBuffer = await sharp(file.buffer)
            .resize(1024, 1024)
            .toFormat("jpeg")
            .jpeg({ quality: 80 })
            .toBuffer();

          const result = await imagesCollection.insertOne({
            filename: file.originalname,
            contentType: "image/jpeg",
            image: resizedBuffer,
          });
          console.log(result);
          return { id: result.insertedId };
        })
      )
    );

    res.status(200).json({
      message: "Images uploaded and processed",
      images: processedImages,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload images." });
  }
});

app.get("/images", async (req, res) => {
  try {
    const imageDoc = await imagesCollection.findOne({});

    if (!imageDoc) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", imageDoc.contentType); // e.g., image/jpeg
    // res.set(
    //   "Content-Disposition",
    //   `attachment; filename="${imageDoc.filename}"`
    // );

    res.set(
      "Content-Disposition",
      ` attachment; filename="${imageDoc.filename}"`
    );
    // res.send(imageDoc.image.buffer); // assuming `imageDoc.buffer` is a Buffer
    res.send(imageDoc.image.buffer); // assuming `imageDoc.buffer` is a Buffer
  } catch (err) {
    console.error("Failed to retrieve image:", err);
    res.status(500).json({ error: "Failed to retrieve image" });
  }
});

app.listen(3000, () => {
  console.log("Server running at 3000");
});
