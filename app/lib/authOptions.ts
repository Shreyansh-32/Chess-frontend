import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import prisma from "./prisma";



export const authOptions : NextAuthOptions = {
  providers : [
    CredentialsProvider({

      name : "Credentials",

      credentials:{
        email : {label : "email" , placeholder : "Email" },
        password : {label : "password" , placeholder : "Password"},
      },

      async authorize(credentials) {
          if(!credentials?.email || !credentials.password){
            throw new Error("Missing email or password");
          }
          try{
            const user = await prisma.player.findFirst({
                where:{
                    username : credentials?.email
                }
            })

              if(!user){
                throw new Error("User with given email doesn't exist");
              }

              const isValid = await bcrypt.compare(credentials.password , user.password);

              if(!isValid){
                throw new Error("Invalid password");
              }

              return{
                id : user.id,
                username : user.username
              };
          }
          catch(err){
            console.error("Auth error: "+err);
            throw err;
          }
      },
    })
  ],

  callbacks:{
    async jwt({user , token}){
      if(user){
        token.id = user.id;
        token.username = user.username;
      }

      return token;
    },

    async session({session , token}){
      if(session.user){
        session.user.id = token.id as number;
        session.user.username = token.username as string;
      }

      return session;
    }
  },

  pages : {
        signIn : "/signin",
        error : "/error"
  },

  session:{
    strategy : "jwt",
    maxAge : 30 * 24 * 60 * 60
  },

  secret:process.env.NEXTAUTH_SECRET

};