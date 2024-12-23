import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Add Product Name"],
    },
    photo: {
        type: String,
        required: [true, "Add Product Photo"],
    },
    price: {
        type: Number,
        required: [true, "Add Product Price"],
    },
    weight: {
        type: String,
        required: [true, "Add Product Price"],
    },
    details: {
        type: String,
        required: [true, "Add Product Details"],
    },
    country: {
        type: String,
        required: [true, "Add Product Country"],
    },
    stock: {
        type: Number,
        required: [true, "Add Stock"],
    },
    category: {
        type: String,
        required: [true, "Seletct Category For Product"],
        trim: true,
    }, 
},
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", schema);
