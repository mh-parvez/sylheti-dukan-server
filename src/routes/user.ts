import { Router } from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user";
import { adminOnly } from "../middlewares/auth";

const router = Router();

// create new user - /api/v1/user/new
router.post("/new", newUser);

// get all user - /api/v1/user/all
router.get("/all", adminOnly, getAllUsers);

// get & delete, one user by id - /api/v1/product/:id
router.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default router;
