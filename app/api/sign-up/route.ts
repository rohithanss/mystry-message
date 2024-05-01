import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import response from "@/lib/response";
import UserModel, { User } from "@/models/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpDataSchema = z.object({data: signUpSchema})
export async function POST(req: Request){
    await dbConnect();

    try{
        const signupData= await req.json();
        const result = signUpDataSchema.safeParse({
            data: signupData
        });
        if(!result.success){
            let errors = result.error.format();
            return Response.json(response(false, "Invalid Data", errors))
        }

        const {username, password, email} = result.data.data;
        const existingUser: User | null = await UserModel.findOne({username, isVerified: true});
        if(existingUser){
            return Response.json(
              response(
                false,
                "User already exists for username: " + username
              )
            );
        }

        let existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exists for email: " + email
                },{
                    status: 400
                })
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;
                existingUserByEmail.username = username;
                await existingUserByEmail.save();
            }
        }else{
            let hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            await newUser.save();
        }

        // send verification email;
        let emailResponse = await sendVerificationEmail(email, username, verifyCode);
        return Response.json(emailResponse, {
            status: emailResponse.success ? 201 : 500
        })
    }catch(error){
        console.error("Error registering user", error);
        return Response.json({
            success : false,
            message: "Error registering user"
        },{
            status: 500
        });
    }
}