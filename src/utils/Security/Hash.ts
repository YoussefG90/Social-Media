import {compare , hash} from 'bcryptjs'

interface HashPayload {
  plaintext: string;
  salt?: string;
}

interface ComparePayload {
  plaintext: string;
  value: string;
}

export const generateHash = async ({plaintext, salt}: HashPayload) : Promise<string> => {
    const saltRounds = salt ? parseInt(salt) : parseInt(process.env.SALT || "12")
    return await hash (plaintext ,saltRounds)
} 

export const compareHash = async ({plaintext, value}:ComparePayload): Promise<boolean> => {
    return await compare (plaintext ,value)
} 