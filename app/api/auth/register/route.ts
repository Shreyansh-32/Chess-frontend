import { prisma } from "@/app/lib/prisma";
import { userSchema } from "@/app/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req : NextRequest){
    console.log("Pointer reached here");
    const data = await req.json();
    const {email , password} = data.data;
    console.log(email , password);

    try{
        const res = userSchema.safeParse({email , password});

        if(res.success){
            const user = await prisma.player.findUnique({
                where:{
                    username : email
                }
            })

            if(user){
                console.log(user);
                return NextResponse.json({"message" : "User with given username already exist"} , {status : 400});
            }

            const hashedPassword = await bcrypt.hash(password , 10);
            await prisma.player.create({
                data:{
                    username:email,
                    password : hashedPassword
                }
            });

            return NextResponse.json({"message" : "User signed up successfully"} , {status : 200});
        }
        else{
            return NextResponse.json({"message"  : "Invalid input format" , res} , {status : 411});
        }
    }catch(err){
        return NextResponse.json({"message" : "Internal server error" , error : err} , {status : 500});
    }
}