import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import response from "@/lib/response";

const AcceptMessageValidateSchema = z.object({
  data: AcceptMessageSchema 
})
export async function POST(req: Request){
  await dbConnect();
  let data = await req.json();
  let result = AcceptMessageValidateSchema.safeParse({data});
  if(!result.success){
    let error = result.error.format();
    return Response.json(response(false, "invalid data", error))
  }
  const session = await getServerSession(authOptions);
  const user : User = session?.user;

  if(!user){
    return Response.json(response(false, "Not Authenticated"), {status: 401});
  };

  const userId = user._id;
  const {acceptMessages} = result.data.data;
  try{
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages}, {new: true});

    if(!updatedUser){
      return Response.json(response(false, "Failed to update user"), {status: 401});
    }

    return Response.json(response(true, "User updated successfully"), {status: 200});

  }catch(err){
    console.log("updating accept message", err);
    return Response.json(response(false, "Error while updating acceptMessage Status"),{
     status: 500 
    })
  }
}

export async function GET(req: Request){
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user : User = session?.user;
  if(!user){
    return Response.json(response(false, "Not Authenticated"), {status: 401});
  };

  try{
    const userId = user._id;
    let foundUser = await UserModel.findById(userId);
    if(!foundUser){
      return Response.json(response(false, "User not found"), {status: 400})
    }
    return Response.json(response(true, `User is ${foundUser.isAcceptingMessages ? '' : 'not '}accepting Messagees`, {isAcceptingMessages: foundUser.isAcceptingMessages}), {status: 200})
  }catch(err){
    return Response.json(response(false, "Failed to get status"), {status: 500});
  }
}
