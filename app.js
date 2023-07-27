const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const dotenv = require("dotenv");


dotenv.config();
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index');
});

app.post("/compressImage", upload.single('filename'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send("Please upload an image file");
    }

    const originalSize = req.file.size;

    try {
        // Compress the uploaded image using Sharp
        const compressedImageBuffer = await sharp(req.file.buffer)
            .resize({ width: 800 }) // Set the desired width of the compressed image
            .toBuffer();

        const compressedSize = compressedImageBuffer.length;
        const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;

        // Set the response headers for download
        res.set('Content-Disposition', 'attachment; filename="compressed_image.jpg"');
        res.set('Content-Type', 'image/jpeg'); // Set the appropriate content type for the image

        // Attach the compression percentage as a response header
        res.append('X-Compression-Percentage', compressionPercentage.toFixed(2) + '%');

        // Send the compressed image back to the client
        res.send(compressedImageBuffer);
    } catch (error) {
        console.error('Error compressing image:', error);
        res.status(500).send('An error occurred while compressing the image.');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
