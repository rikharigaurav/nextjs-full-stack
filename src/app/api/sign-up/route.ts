import connectDB from "@/lib/dbConnect";
import bcrypt from 'bcryptjs'
import User from "@/model/User.model";
import { sendVerificationEmail } from "@/helpers/sendVerifyEmail";

export async function POST(request: Request) {
    await connectDB();

    try {
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await User.findOne({
            username: username
        })

        if(existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken"
                }, {
                    status: 400
                }
            )
        }

        //Creating Verify Code
        const verifyCode = Math.floor(10000 + Math.random() * 9900000).toString()

        const existingUserByEmail = await User.findOne({
            email: email
        })

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified) {
                return Response.json(
                  {
                    success: false,
                    message: "user already exists",
                  },
                  {
                    status: 400,
                  }
                )
            } else {
                const hasedpassword = await bcrypt.hash(password, 10)

                existingUserByEmail.password = hasedpassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

                await existingUserByEmail.save()
            }
        } else {
            const hasedpassword = await bcrypt.hash(password, 10)

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new User({
                username,
                email,
                password: hasedpassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return Response.json(
            {
                success: false,
                message: "User registered Successfully. Please verify your email",
            },
            {
                status: 201,
            }
        ) 

    } catch (error) {
        console.error("Error registering user", error)
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}