import { TryCatch } from "../middlewares/error";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { User } from "../models/user";
import { calculatePercentage } from "../utils/calulate.percentage";
import { getInventories } from "../utils/get.inventories";
import { getMonthlyData } from "../utils/monthly.data";
import { nodeCache } from "../utils/node.cache";


// ------ Get Dashboard States ------
export const getDashboardStates: any = TryCatch(async (_req, res, _next) => {

    let stats = {};
    let cacheKey = "admin-stats";

    if (nodeCache.has(cacheKey)) {
        stats = JSON.parse(nodeCache.get(cacheKey) as string);

    } else {

        const today = new Date();

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        // Last Six Month Revenue and Trnasaction chart
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        // Products Details
        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        // Users Details
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        // Order Details
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        // last six month order and revenue
        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        })

        // latest transections
        const latestTransectionsPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(5)

        // resolve all promise
        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProudcts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransections
        ] = await Promise.all(
            [
                thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthOrdersPromise,
                Product.distinct("category"),
                User.countDocuments({ gender: "female" }),
                latestTransectionsPromise
            ]
        );

        // get revenue
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

        const count = {
            revenue,
            user: usersCount,
            product: productsCount,
            order: allOrders.length
        }

        // last six month revenue and order chart
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }

        })

        const categoryCount = await getInventories({ categories, productsCount });

        // change parcent
        const changeParcent = {
            products: calculatePercentage(thisMonthProducts.length, lastMonthProudcts.length),
            users: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            orders: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
        }

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount
        }

        const modifiedLastestTrnasections = latestTransections.map((i) => ({
            _id: i.id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }))

        stats = {
            categoryCount,
            changeParcent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
            userRatio,
            latestTransections: modifiedLastestTrnasections
        }

        nodeCache.set(cacheKey, JSON.stringify(stats))
    }

    return res.status(200).json({
        success: true,
        stats
    })
});


// ------ Get Pie Charts ------
export const getPieCharts: any = TryCatch(async (req, res, next) => {

    let charts;
    let cacheKey = "admin-pie-charts";

    if (nodeCache.has(cacheKey)) {
        charts = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {

        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUser,
            customerUsers,
        ] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            Order.find({}).select(["total", "discount", "subtototal", "tax", "shippingCharges"]),
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ])

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            deliverd: deliveredOrder,
        }

        const productCategories = await getInventories({ categories, productsCount });

        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outOfStock
        }

        const grossIncome = allOrders.reduce((prev, order) => {
            return prev + (order.total || 0)
        }, 0)

        const discount = allOrders.reduce((prev, order) => {
            return prev + (order.discount || 0)
        }, 0)

        const producitonCost = allOrders.reduce((prev, order) => {
            return prev + (order.shippingCharges || 0)
        }, 0)

        const burnt = allOrders.reduce((prev, order) => {
            return prev + (order.tax || 0)
        }, 0)

        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = grossIncome - discount - producitonCost - burnt - marketingCost

        const revenueDistribution = {
            netMargin,
            discount,
            producitonCost,
            burnt,
            marketingCost,
        }

        const userAgeGroup = {
            teen: allUsers.filter((i) => i.age! < 20).length,
            adult: allUsers.filter((i) => i.age! >= 20 && i.age! < 40).length,
            old: allUsers.filter((i) => i.age! >= 40).length,
        }

        const adminCustomer = {
            admin: adminUser,
            customer: customerUsers
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            userAgeGroup,
            adminCustomer,
        }

        nodeCache.set(cacheKey, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    })
});


// ------ Get Bar Charts ------
export const getBarCharts: any = TryCatch(async (req, res, next) => {

    let charts;
    const cacheKey = "admin-bar-charts";

    if (nodeCache.has(cacheKey)) {
        charts = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {

        const today = new Date();

        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt")

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt")

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today
            }
        }).select("createdAt");

        const [products, users, orders] = await Promise.all([
            sixMonthProductsPromise, sixMonthUsersPromise, twelveMonthOrdersPromise
        ]);

        const productCounts = getMonthlyData({ length: 6, today, docArray: products });
        const userCounts = getMonthlyData({ length: 6, today, docArray: users });
        const orderCounts = getMonthlyData({ length: 12, today, docArray: orders });

        charts = {
            users: userCounts,
            product: productCounts,
            orders: orderCounts
        }

        nodeCache.set(cacheKey, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    })
});


// ------ Get Line Charts ------
export const getLineCharts: any = TryCatch(async (req, res, next) => {

    let charts;
    const cacheKey = "admin-line-charts";

    if (nodeCache.has(cacheKey)) {
        charts = JSON.parse(nodeCache.get(cacheKey) as string);
    } else {

        const today = new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const basequery = {
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today
            }
        }

        const [products, users, orders] = await Promise.all([
            Product.find(basequery).select("createdAt"),
            User.find(basequery).select("createdAt"),
            Order.find(basequery).select(["createdAt", "discount", "total"]),
        ]);

        const productCounts = getMonthlyData({ length: 12, today, docArray: products });
        const userCounts = getMonthlyData({ length: 12, today, docArray: users });
        const discount = getMonthlyData({ length: 12, today, docArray: orders, property: "discount" });
        const revenue = getMonthlyData({ length: 12, today, docArray: orders, property: "total" });

        charts = {
            users: userCounts,
            product: productCounts,
            discount,
            revenue,
        }

        nodeCache.set(cacheKey, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    })
});
