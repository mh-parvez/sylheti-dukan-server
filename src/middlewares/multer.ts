import multer from "multer";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
    destination(_req, _file, callback) {
        callback(null, "uploads");
    },

    filename(_req, file, callback) {
        const id = uuid();
        const extentionName = file.originalname.split(".").pop();
        const fileName = `${id}.${extentionName}`
        callback(null, fileName);
    }
});

export const singleUpload = multer({ storage }).single("photo");
