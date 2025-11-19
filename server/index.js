import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env from root + server folder
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'

// Routes
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import bannerRouter from './route/banner.route.js'

const app = express()

// ----------------------
// ✅ FIXED CORS CONFIG
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://freshmartecom.vercel.app",
  "https://freshmartecom-fdjo.vercel.app"
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)  // allow Postman, mobile apps, etc.

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("CORS Not Allowed: " + origin))
      }
    },
  })
)

// handle preflight requests
app.options("*", cors())

// ----------------------
// Middlewares
// ----------------------
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

// ----------------------
// Routes
// ----------------------
app.get("/", (req, res) => {
  res.json({ message: "Server is running on PORT " + (process.env.PORT || 8080) })
})

app.use("/api/user", userRouter)
app.use("/api/category", categoryRouter)
app.use("/api/file", uploadRouter)
app.use("/api/subcategory", subCategoryRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/address", addressRouter)
app.use("/api/order", orderRouter)
app.use("/api/banner", bannerRouter)

// ----------------------
// Connect DB & Start Server
// ----------------------
const PORT = process.env.PORT || 8080

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server running on", PORT)
  })
})
