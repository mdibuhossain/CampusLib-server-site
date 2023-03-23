const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { graphqlHTTP } = require("express-graphql");
const { connectDB } = require("./Config/db");
const schema = require("./Schema/schema");
const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const PUBLIC_STATIC = path.join(__dirname, 'public')
const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_STATIC));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(PUBLIC_STATIC, "image"))
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname)
    cb(null, file.fieldname + fileExt)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000 // 1MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only png, jpg, jpeg and webp is allowed!"))
    }
  }
})

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_EVN === "development",
  })
);

app.post('/test', upload.any(), (req, res) => {
  res.status(200).json({ "status": "Success" })
})

app.use((err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).send("There was an upload error!")
    } else {
      res.status(500).send(err.message)
    }
  } else {
    res.send("success")
  }
})

app.listen(port, () => console.log(`Server running on ${port}`));
