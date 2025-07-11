"use client";

import { Chess, Color } from "chess.js";
import React, { useEffect, useState } from "react";
import { useSocket } from "../lib/useSocket";
import ChessBoard from "./ChessBoard";
import { Session } from "next-auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export default function GameComponent({ session }: { session: Session | null }) {
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState<boolean>(false);
  const [myColor, setMyColor] = useState<Color>("w");
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<"draw" | "white" | "black" | null>(null);
  const [player1Time, setPlayer1Time] = useState<number>(10 * 60 * 1000);
  const [player2Time, setPlayer2Time] = useState<number>(10 * 60 * 1000);
  const [gameHistory, setGameHistory] = useState<string[] | undefined>();
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === INIT_GAME) {
        setChess(new Chess());
        setStarted(true);
        setMyColor(message.payload.color === "white" ? "w" : "b");
        message.payload.color === "white"
          ? setBoard(chess.board())
          : setBoard(chess.board().reverse());
        setLoading(false);
        setWinner(null);
        setPlayer1Time(5 * 60 * 1000);
        setPlayer2Time(5 * 60 * 1000);
        setGameHistory(undefined);
        new Audio("/GameOver.mp3").play();
      }

      if (message.type === MOVE) {
        chess.move(message.payload.move);
        myColor === "w"
          ? setBoard(chess.board())
          : setBoard(chess.board().reverse());
        setPlayer1Time(parseInt(message.payload.player1TimeLeft));
        setPlayer2Time(parseInt(message.payload.player2TimeLeft));
        setGameHistory(message.payload.gameHistory);
        new Audio("/Move.mp3").play();
      }

      if (message.type === GAME_OVER) {
        setStarted(false);
        setWinner(message.payload.winner);
        setPlayer1Time(parseInt(message.payload.player1TimeLeft));
        setPlayer2Time(parseInt(message.payload.player2TimeLeft));
        new Audio("/GameOver.mp3").play();
        setChess(new Chess());
        setBoard(chess.board());
      }

      if (message.type === "live_game") {
        chess.load(message.payload.board);
        message.payload.color === "w"
          ? setBoard(chess.board())
          : setBoard(chess.board().reverse());
        setStarted(true);
        setMyColor(message.payload.color);
        setLoading(false);
        setPlayer1Time(parseInt(message.payload.player1TimeLeft));
        setPlayer2Time(parseInt(message.payload.player2TimeLeft));
        setGameHistory(message.payload.gameHistory);
      }
    };

    if (!started) return;
    const interval = setInterval(() => {
      setPlayer1Time((prev) => (chess.turn() === "w" ? prev - 1000 : prev));
      setPlayer2Time((prev) => (chess.turn() === "b" ? prev - 1000 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [socket, chess, board, myColor, started]);

  if (!session) {
    toast.error("Sign in to play");
    router.push("/signin");
    return null;
  }

  if (!socket) return null;

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row gap-6 justify-center items-center p-4">
      <ChessBoard
        id={session.user.id}
        chess={chess}
        myColor={myColor}
        board={board}
        socket={socket}
        player1Time={player1Time}
        player2Time={player2Time}
      />

      <div className="md:h-[520px] md:w-[280px] w-full rounded-xl bg-gray-800 text-white shadow-lg p-4 flex flex-col gap-4 overflow-y-auto">
        {!started ? (
          <button
            onClick={() => {
              setLoading(true);
              socket?.send(
                JSON.stringify({ type: INIT_GAME, payload: { id: session.user.id } })
              );
            }}
            className={`bg-green-600 text-lg font-medium py-2 px-4 rounded-md hover:bg-green-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Waiting..." : "Start Game"}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <h3 className="text-center font-semibold border-b pb-2">Moves</h3>
            <div className="grid grid-cols-2 text-center gap-2">
              {gameHistory?.map((move, idx) => (
                <motion.span
                  key={idx}
                  className="bg-gray-700 p-2 rounded-md"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {(idx + 1) % 2 === 1 ? Math.ceil((idx + 1) / 2) + "." : ""} {move}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {winner && !started && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-6 rounded-xl shadow-xl text-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {winner === "draw"
              ? "It's a Draw!"
              : winner === "white"
              ? "White Wins!"
              : "Black Wins!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
