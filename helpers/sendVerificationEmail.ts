import VerificationEmail from "@/email/VerificationEmail";
import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
):Promise<ApiResponse>{
    try{
        const { data, error } = await resend.emails.send({
            from: 'Hans <hans@thapardogschool.in>',
            to: [email],
            subject: 'Hello world',
            react: VerificationEmail({ username, otp: verifyCode}),
        });
        if(error){
            throw error;
        }
        return {success: true, message: "Verification email send successfully"};
    }catch(error){
        console.error("Error sending verification email", error);
        return {success: false, message: "Failed to send verification email"};
    }
}