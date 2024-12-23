
import mongoose from "mongoose";

export const connectMongoDB = async (uri: string) => {
	try {
		const db: string = "ecommerceTest"
		await mongoose.connect(`${uri}/${db}`);
		console.log(`DB: Connected`);

	} catch (error) {
		console.log(error);
		console.log("DB: Not Connected");
		process.exit(1);
	}
};
