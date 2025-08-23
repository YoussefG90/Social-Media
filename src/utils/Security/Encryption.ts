import CryptoJS from "crypto-js";

interface EncryptionPayload {
  plaintext:string;
  secrtkey?:string
}

interface DecryptionPayload {
  ciphertext:string;
  secrtkey?:string
}

export const generateEncryption =
     ({plaintext, secrtkey = process.env.ENCRYPTIONKEY as string}: EncryptionPayload) => {
        return CryptoJS.AES.encrypt(plaintext ,secrtkey).toString()
}

export const generateDecryption =
     ({ciphertext, secrtkey = process.env.ENCRYPTIONKEY as string}: DecryptionPayload) => {
        return CryptoJS.AES.decrypt(ciphertext ,secrtkey).toString(CryptoJS.enc.Utf8)
}