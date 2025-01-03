
import { Product } from "../models/product";
import { OrderItemType } from "../types/type";

export const reduceStock = async (orderItems: OrderItemType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product Not Found!");
        product.stock = product.stock - order.quantity;
        await product.save();
    };
};
