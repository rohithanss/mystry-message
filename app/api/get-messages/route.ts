import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import response from "@/lib/response";
import mongoose from "mongoose";

export async function GET(req: Request){
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user : User = session?.user;
  if(!user){
    return Response.json(response(false, "Not Authenticated"), {status: 401});
  };

  try{
    const userId =new mongoose.Types.ObjectId(user._id);
    console.log(userId, user, 'user')
    let foundUser = await UserModel.aggregate([
      {$match: {_id: userId}},
      {$unwind: "$messages"},
      {$sort: {'messages.createdAt': -1}},
      {$group : {_id: "$_id", messages: {$push: "$messages"}}}
    ]);
    console.log(foundUser)
    if(!foundUser || !foundUser.length){
      return Response.json(response(false, "User not found"), {status: 400})
    }

    return Response.json(response(true, "Messages fetched successfully", {messages: foundUser[0]?.messages}));
  }catch(err){
    return Response.json(response(false, "Failed to get status"), {status: 500});
  }
}