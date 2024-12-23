import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { NewOrderRequestBody } from "../types/type";
import { Order } from "../models/order";
import { reduceStock } from "../utils/reduce.stock";
import { invalidateCache, nodeCache } from "../utils/node.cache";
import ErrorHandler from "../utils/utility.class";


// ------ User Orders ------
export const myOrder: any = TryCatch(async (req, res, _next) => {

    const { id: user } = req.query;
    const cacheKey = `my-orders-${user}`;
    let orders = null;

    if (nodeCache.has(cacheKey)) {
        orders = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        orders = await Order.find({ user });
        nodeCache.set(cacheKey, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders
    });
});


// ------ Admin All Orders ------
export const allOrders: any = TryCatch(async (_req, res, _next) => {

    let orders = null;
    const cacheKey = `all-orders`;

    if (nodeCache.has(cacheKey)) {
        orders = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        orders = await Order.find().populate("user", "name _id");
        nodeCache.set(cacheKey, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders
    });
});


// ------ Get Single ------
export const getSingleOrders: any = TryCatch(async (req, res, next) => {

    const { id } = req.params;
    const cacheKey = `order-${id}`;
    let order = null;

    if (nodeCache.has(cacheKey)) {
        order = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {
        order = await Order.findById(id).populate("user", "name _id");
        if (!order) return next(new ErrorHandler("Order not found!", 404));

        nodeCache.set(cacheKey, JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order
    });
});


// ------ Create New Order ------
export const newOrder: any = TryCatch(async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {

    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total } = req.body;

    // TODO: Add Validation 
    await Order.create({ shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total });

    await reduceStock(orderItems);
    await invalidateCache({ product: true, order: true, admin: true, userId: user });

    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully!",
    });
});


// ------ Process Order ------
export const processOrder: any = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) next(new ErrorHandler("Order Not Found!", 404));

    switch (order?.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Devlivered";
            break;
        case "Devlivered":
            order.status = "Devlivered";
            break;
    }

    await order?.save();
    await invalidateCache({ product: false, order: true, admin: true, userId: order?.user });

    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully!",
    });
});


//------ Delete Order ------
export const deleteOrder: any = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) next(new ErrorHandler("Order Not Found!", 404));

    await order?.deleteOne()
    await invalidateCache({ product: false, order: true, admin: true, userId: order?.user });

    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully!",
    });
});

