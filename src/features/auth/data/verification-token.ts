import { db } from "@/src/db"

export const getVerificationTokenByEmail = async (email: string) => {
   try {
       const verificationToken = await db.verificationToken.findFirst({
        where: { email: email}
       })

       return verificationToken
   } catch (error) {
       console.log('Error while getting email verification token: ', error)
   }
}
export const getVerificationTokenByToken = async (token: string) => {
   try {
       const verificationToken = await db.verificationToken.findUnique({
        where: {token}
       })

       return verificationToken
   } catch (error) {
       console.log('Error while getting email verification token: ', error)
   }
}
