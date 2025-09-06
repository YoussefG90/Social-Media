import {z} from 'zod';
import { logoutEnum } from '../../utils/Security/Token';
import { genralFields } from '../../middleware/validation.middleware';
import { fileValidation } from '../../utils/Multer/cloud';


export const logout = {
    body:z.strictObject({
        flag:z.enum(logoutEnum).default(logoutEnum.signout)
    })
}

export const profileImage = {
    file:z.strictObject({
        fieldname:genralFields.file.fieldname.includes("Image"),
        originalname:genralFields.file.originalname,
        encoding:genralFields.file.encoding,
        mimetype:z.enum(fileValidation.Image as [string, ...string[]]),
        destination:genralFields.file.destination,
        filename:genralFields.file.filename,
        path:genralFields.file.path,
        size:genralFields.file.size
    })
}

export const coverImage = {
    file:profileImage.file.extend({
        fieldname:genralFields.file.fieldname.includes("Cover")
    })
}