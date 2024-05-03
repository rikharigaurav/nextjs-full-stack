import { resend } from "@/lib/resend";
import  VerificationEmail from "../../emails/verifyEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'example@example.com',
            to: 'user@gmail.com',
            subject: "hello world",
            react: VerificationEmail({username, otp: verifyCode})
        })
        return { 
            success: false, 
            message: 'Failed to send Verificaiton email'
        }
    } catch (emailError) {
        console.log("Error sending verification email", emailError)
        return { 
            success: false, 
            message: 'Failed to send Verificaiton email'
        }
    }
}