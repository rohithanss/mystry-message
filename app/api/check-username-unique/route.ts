import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const UsernameQuerySchema = z.object({
  username: usernameValidation
});

export async function GET(req: Request){
  await dbConnect();
  try{
    const {searchParams} = new URL(req.url);
    const queryParams = {username : searchParams.get('username')};

    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log(result, 'result from zod');
    if(!result.success){
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json({
        success:false,
        message: usernameErrors.length > 0 ? usernameErrors.join(', ') : 'Invalid query params'
      },{
        status: 400
      }
    )
    }

    const {username} = result.data;
    let existingUser = await UserModel.findOne({username, isVerified: true});

    if(existingUser){
      return Response.json({
        success: false,
        message: "Username is unavailable"
      },
    );
    }

    return Response.json({
      success:true,
      message:"username is unique"
    },{
      status:200
    }
  )
  }catch(err){
    console.log("error checking username", err);
    return Response.json({
      success: false,
      message: "Error checking username"
    }, {
      status: 500
    })
  }
}

export async function POST(req:Request){
  return Response.json({
    success:"false",
    message:"error msg"
  })
}