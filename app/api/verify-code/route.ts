import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { verifySchema } from "@/schemas/verifySchema";
import { z } from "zod";

const VerifyCodeSchema = z.object({
  data: verifySchema,
});

export async function POST(req: Request) {
  await dbConnect();
  let data = await req.json();

  try {
    const result = VerifyCodeSchema.safeParse({ data });
    if (!result.success) {
      let error = result.error.format();
      return Response.json(
        {
          success: false,
          message: "Invalid Data",
          error: error,
        },
        {
          status: 400,
        }
      );
    }
    let { username, code } = result.data.data;
    const user = await UserModel.findOne({ username, verifyCode:  code });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid Verification code",
        },
        {
          status: 400,
        }
      );
    }

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if(!isCodeNotExpired){
      return  Response.json(
        {
          success: false,
          message: "Verification code is expired, signup again to get a new code",
        },
        {
          status: 400,
        }
      );
    }
    user.isVerified = true;
    await user.save();
    return  Response.json(
      {
        success: true,
        message: "User verified successfully",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(err, 'verify-code');
    return Response.json({
      success: false,
      message: "Error while verifying code",
    }, {status: 500});
  }
}
