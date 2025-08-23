import bcryptjs from 'bcryptjs'

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
    return bcryptjs.hashSync(plaintext ,saltRounds)
} 

export const compareHash = async ({plaintext, value}:ComparePayload): Promise<boolean> => {
    return  bcryptjs.compareSync(plaintext ,value)
} 