import { Router } from "express";
import { adminOnly } from "../middlewares/auth";
import { allOrders, deleteOrder, getSingleOrders, myOrder, newOrder, processOrder } from "../controllers/order";

const router = Router();

// create new order - /api/v1/order/new
router.post("/new", newOrder)

// get user order - /api/v1/order/my
router.get("/my", myOrder)

// get all order - /api/v1/order/all
router.get("/all", adminOnly, allOrders)

// get, update, delete single order - /api/v1/order/:id
router.route("/:id").get(getSingleOrders).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);

export default router;
