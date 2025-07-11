"use client";
import { useEffect, useState } from "react"

export const useSocket = () =>{
    const [socket , setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => {
            setSocket(ws);
            console.log("connected");
        }

        ws.onclose = () => {
            setSocket(null);
            console.log("disconnected");
        }

        return() =>{
            ws.close();
        }
    } , [])

    return socket;
}