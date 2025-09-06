import { Request } from "express"
import multer, { FileFilterCallback } from "multer"

export const fileValidation = {
  Image: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf", "application/msword"],
  video: ["video/mp4", "video/x-msvideo", "video/x-ms-wmv"],
  audio: ["audio/mpeg", "audio/mp3", "audio/ogg"]
}

// const maxSizePerType = {
//   image: 10 * 1024 * 1024,
//   video: 100 * 1024 * 1024,
//   document: 5 * 1024 * 1024,
//   audio: 20 * 1024 * 1024
// }


export const cloudFiles = ({ validation = [] as string[] }: { validation?: string[] } = {}) => {
  
  const storage = multer.diskStorage({})

  const fileFilter = function (req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true)
    }
    return callback(new Error("In-Valid File Format") as unknown as null, false);
  }
  
  return multer({ fileFilter, storage })
}
