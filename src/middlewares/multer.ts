import multer from "multer";
// import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
    destination(_req, _file, callback) {
        callback(null, "uploads");
    },

    filename(_req, file, callback) {

        /* modified file name */
        // const id = uuid();
        // const extentionName = file.originalname.split(".").pop();
        // const fileName = `${id}.${extentionName}`
        // callback(null, fileName);

        /* original file name */
        callback(null, file.originalname)
    }
});

export const singleUpload = multer({ storage }).single("photo");
