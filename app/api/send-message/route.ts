import dbConnect from "@/lib/dbConnect";
import UserModel, {Message} from "@/models/User";
import { z } from "zod";
import response from "@/lib/response";
import { messageSchema } from "@/schemas/messageSchema";

const MessageDataSchema = z.object({data: messageSchema});
export async function POST(req:Request){
  await dbConnect();
  try{
    let data = await req.json();
    let result = MessageDataSchema.safeParse({data});
    if(!result.success){
      let error = result.error.format();
      return Response.json(response(false, "Invalid Data", error), {status: 400})
    }
    const {content, username} = result.data.data;
    let user = await UserModel.findOne({username});
    if(!user){
      return Response.json(response(false, "User Not Found"), {status: 400});
    }

    if(!user.isAcceptingMessages){
      return Response.json(response(false, "User not accepting messages"), {status: 403});
    }

    const newMessage = {content, createdAt: new Date()};
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(response(true, "Message send successfully"), {status: 201});
  }catch(err){
    return Response.json(response(false, "Failed to send message"), {status: 500})
  }
}