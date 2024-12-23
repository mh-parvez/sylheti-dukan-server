import { Router } from "express";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product";
import { adminOnly } from "../middlewares/auth";
import { singleUpload } from "../middlewares/multer";

const router = Router();

// create new product - /api/v1/product/new
router.post('/new', adminOnly, singleUpload, newProduct);

// get latest 10 product - /api/v1/product/latest
router.get('/latest', getLatestProducts);

// get all product with filter - /api/v1/product/all
router.get('/all', getAllProducts);

// get all unique - /api/v1/product/categories
router.get('/categories', getAllCategories);

// get all unique - /api/v1/product/admin-product
router.get('/admin-product', adminOnly, getAdminProducts);

// get, update, delete single proudct - /api/v1/product/:id
router.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct);

export default router;
