import NodeCache from "node-cache";
import { InvalidateCacheProps } from "../types/type";
import { Product } from "../models/product";
import { Order } from "../models/order";

export const nodeCache = new NodeCache();

export const createCache = (cacheKey: string, data: any) => {

    if (nodeCache.has(cacheKey)) {
        data = JSON.parse(nodeCache.get(cacheKey) as string);
        // console.log("From Cache: ", data);
    } else {
        nodeCache.set(cacheKey, JSON.stringify(data));
    }
}

export const invalidateCache = async ({ product, order, admin, userId }: InvalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = ["latest-products", "categories", "all-products"];
        const products = await Product.find({}).select("_id");

        products.forEach(i => {
            productKeys.push(`product-${i._id}`);
        });
        nodeCache.del(productKeys);
    }

    if (order) {
        const orderKeys: string[] = ["all-orders", `my-orders-${userId}`];

        const orders = await Order.find({}).select("_id");
        orders.forEach(i => {
            orderKeys.push(`order-${i._id}`)
        });

        nodeCache.del(orderKeys);
    }

    if (admin) {
        nodeCache.del(["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"])
    }
}
