import mongoose from "mongoose";

interface IUser extends Document {
	_id: string;
	name: string;
	email: string;
	photo: string;
	role: "admin" | "user";
	gender: "male" | "female";
	dob: Date;
	createdAt: Date;
	updatedAt: Date;
	age?: number; //optional property
}

const schema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: [true, "Please enter ID"],
		},
		name: {
			type: String,
			required: [true, "Please enter name"],
		},
		email: {
			type: String,
			unique: [true, "Email already exist"],
			required: [true, "Please enter email"],
		},
		photo: {
			type: String,
			required: [true, "Please add photo"],
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "admin",
		},
		gender: {
			type: String,
			enum: ["male", "female"],
			required: [true, "Please enter your gender"],
		},
		dob: {
			type: Date,
			required: [true, "Please enter your date-of-birth"],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObjects: { virtuals: true },
	}
);

// add virtual age property
schema.virtual("age").get(function (this: IUser) {
	if (!this.dob) return null;
	const ageDifMs = Date.now() - this.dob.getTime();
	const ageDate = new Date(ageDifMs);
	return Math.abs(ageDate.getUTCFullYear() - 1970);
});

export const User = mongoose.model<IUser>("User", schema);
