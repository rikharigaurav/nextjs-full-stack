import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcryptjs from "bcryptjs";

import connectDB  from "@/lib/dbConnect";
import User from "@/model/User.model";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any>{
                await connectDB();

                try {
                    const user = await User.findOne({
                        $or: [
                            {email: credentials.indentifier},
                            {username: credentials.indentifier}
                        ]
                    })

                    if(!user) {
                        throw new Error("No user found with this email")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account first")
                    }

                    const comparePassword = await bcryptjs.compare(credentials.password, user.password)
                    if(comparePassword){
                        return user
                    } else{
                        throw new Error('Invalid password')
                    }
                    

                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })  
    ],
    callbacks: {
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }

            return session
        },
        async jwt({ token, user }) {
            
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }

            return token
        }
    },
    pages: {
        signIn: '/sign-in'
    }, 
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXT_AUTH_KEY
}