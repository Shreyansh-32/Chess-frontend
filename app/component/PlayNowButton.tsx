"use client";

import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ({session} : {session : Session | null
}) {
    const router = useRouter();
  return (
    <button className="group relative px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:from-amber-600 hover:to-amber-700 transform hover:scale-105 transition-all duration-300 ease-out"
    onClick={() => {
        if(!session || !session.user.id){
            toast.error("Sign in to play");
            router.push("/signin");
        }
        else{
            router.push("/game");
        }
    }}
    >
      <span className="relative z-10">Play Now</span>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}
