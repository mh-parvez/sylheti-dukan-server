
import { faker } from "@faker-js/faker";
import { Product } from "../models/product";

export const generateRandomProducts = async (count: number = 10) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\0b6d0635-f1cb-4bc8-b302-442eac2eca73.png",
            price: faker.commerce.price({
                min: 1500,
                max: 800000,
                dec: 0,
            }),
            stock: faker.commerce.price({
                min: 0,
                max: 100,
                dec: 0,
            }),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent())
        }
        products.push(product);
    }

    await Product.create(products);
    console.log(`${count} Products Created`);
}

export const deleteRandomProducts = async (count: number = 10) => {
    const products = await Product.find({}).skip(2);

    for (let i = 0; i < count; i++) {
        const product = products[i];
        await product.deleteOne();
    }
    console.log(`${count} Products Deleted`);
}
