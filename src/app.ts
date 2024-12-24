import cors from "cors";
import express from "express";
import Stripe from "stripe";
import { connectMongoDB } from "./utils/db.mongo";

import dashboardRoute from "./routes/dashboard";
import orderRoute from "./routes/order";
import paymentRoute from "./routes/payment";
import productRoute from "./routes/product";
import userRoute from "./routes/user";

import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error";

import { config } from "dotenv";
config({ path: "./.env" });

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

export const stripe = new Stripe(stripeKey);

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => { res.send(`API working with /api/v1`) });
app.use("/api/v1/user", userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/dashboard', dashboardRoute);

app.use("/uploads", express.static("uploads"))
app.use(errorMiddleware);

app.listen(port, async () => {
	console.log(`Server is working on http://localhost:${port}`);
	await connectMongoDB(mongoURI);
});
