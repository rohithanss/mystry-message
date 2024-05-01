import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials = { identifier: "", password: "" },
        req
      ): Promise<any> {
        // Add logic here to look up the user from the credentials supplied
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials?.identifier },
              { username: credentials?.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email/username");
          }
          if (!user?.isVerified) {
            throw new Error("Please verify your account before login");
          }

          let isPassword = await bcrypt.compare(
            credentials?.password,
            user.password
          );
          if (isPassword) {
            return user;
          } else {
            throw new Error("Invalid Password");
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<any> {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }): Promise<any> {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
