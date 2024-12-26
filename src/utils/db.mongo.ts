import mongoose from "mongoose";

export const connectMongoDB = async (uri: string) => {
	mongoose
		.connect(uri, {
			dbName: "sylheiDukan",
		})
		.then((c) => console.log(`DB Connected to ${c.connection.host}`))
		.catch((e) => console.log(e));
};

// MongoAtlas db name: sylheiDukan
// Local db name: ecommerceTest
