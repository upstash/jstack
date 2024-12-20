"use server"

import { db } from "@/src/db"
import { getUserByEmail } from "../data/user"
import { getVerificationTokenByToken } from "../data/verification-token"

export const newVerification = async (token: string) => {
   try {
       const existingToken = await getVerificationTokenByToken(token)
       if(!existingToken) return { error: "Token does not exist."}

       const hasExpired = new Date(existingToken.expires) < new Date()
       if(hasExpired) return { error: "Token expired"}

       const existingUser = await getUserByEmail(existingToken.email)
       if(!existingUser) return { error: "Email does not exists"}

       await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email,
        }
       })
       await db.verificationToken.delete({
        where: { id: existingToken.id}
       })

       return { success: "Email verified successfully"}
   } catch (error) {
       console.log('Error in new verification', error)
   }
}
