import { TryCatch } from "../middlewares/error"
import { NextFunction, Request, Response } from "express"
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/type";
import { Product } from '../models/product';
import ErrorHandler from "../utils/utility.class";
import { rm } from "fs";
// import { generateRandomProducts, deleteRandomProducts } from "../utils/fake.data";
import { invalidateCache, nodeCache } from "../utils/node.cache";


//------ Get Latest Products ------
export const getLatestProducts: any = TryCatch(async (_req, res, _next) => {

    let products = null;
    let cacheKey = "latest-products";

    if (nodeCache.has(cacheKey)) {
        products = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(20);
        nodeCache.set(cacheKey, JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products
    })
});


//------ Get All Products Categories ------
export const getAllCategories: any = TryCatch(async (_req, res, _next) => {

    let categories = null;
    let cacheKey = "categories";

    if (nodeCache.has(cacheKey)) {
        categories = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        categories = await Product.distinct("category")
        nodeCache.set(cacheKey, JSON.stringify(categories));
    }

    return res.status(200).json({
        success: true,
        categories
    })
});


//------ Get All Admin Products ------
export const getAdminProducts: any = TryCatch(async (_req, res, _next) => {

    let products = null;
    let cacheKey = "all-products";

    if (nodeCache.has(cacheKey)) {
        products = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        products = await Product.find({})
        nodeCache.set(cacheKey, JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products
    })
});


//------ Get Single Product ------
export const getSingleProduct: any = TryCatch(async (req, res, next) => {

    let product = null;
    let id = req.params.id;
    let cacheKey = `product-${id}`;

    if (nodeCache.has(cacheKey)) {
        product = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        product = await Product.findById(id);
        if (!product) return next(new ErrorHandler("Invaild product Id or Product not found!", 404));
        nodeCache.set(cacheKey, JSON.stringify(product));
    }

    return res.status(200).json({
        success: true,
        product
    })
});


//------ Create New Product ------
export const newProduct: any = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
    const { name, category, price, weight, stock, details, country } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please! add product photo", 400));

    if (!name || !category || !price || !stock || !weight || !details || !country) {
        rm(photo.path, () => console.log("Extra Photo Deleted"))
        return next(new ErrorHandler("Make Sure You Provide All Infomation", 400))
    }

    await Product.create({
        name,
        price,
        weight,
        stock,
        details,
        country,
        category: category.toLowerCase(),
        photo: photo?.path
    })

    await invalidateCache({ product: true, admin: true }); // when add new product

    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    })
});


//------ Update Product ------
export const updateProduct: any = TryCatch(async (req, res, next) => {

    const { id } = req.params;
    const { name, category, price, stock, weight, details, country } = req.body;
    const photo = req.file;

    const product = await Product.findById(id); // old product
    if (!product) return next(new ErrorHandler("Invaild Product ID or Product Not Found!", 404))

    if (photo) {
        rm(product.photo!, () => console.log('Previous Photo Deleted'));
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (weight) product.weight = weight;
    if (stock) product.stock = stock;
    if (details) product.details = details;
    if (country) product.country = country;
    if (category) product.category = category.toLowerCase();

    product.save();

    await invalidateCache({ product: true, admin: true }); // when update a product

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    })
});


//------ Delete Product ------
export const deleteProduct: any = TryCatch(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Invaild Product ID or Product Not Found!", 404));

    rm(product.photo!, () => console.log('Product Photo Deleted'));
    await product.deleteOne();

    await invalidateCache({ product: true, admin: true }); // when delete a product

    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    })
});


//------ Searching Products ------
export const getAllProducts: any = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res: Response, next: NextFunction) => {

    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page);

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 20; // pagination
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i"
        }
    }

    if (price) {
        baseQuery.price = {
            $lte: Number(price)
        }
    }

    if (category) {
        baseQuery.category = category
    }

    const productPromise = await Product.find(baseQuery)
        .sort(sort && { price: sort === 'asc' ? 1 : -1 })
        .limit(limit)
        .skip(skip)

    // Paralal query for optimization
    const [products, filteredOnlyProduct] = await Promise.all([
        productPromise,
        Product.find(baseQuery)
    ])

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
        success: true,
        products,
        totalPage
    })
});

// generateRandomProducts(40); /* Every function call it will be create 40 products */
// deleteRandomProducts(38)
