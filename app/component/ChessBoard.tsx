"use client";

import { Chess, Color, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ChessBoard({
    board, socket, myColor, chess, id, player1Time, player2Time
}: {
    board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][],
    socket: WebSocket,
    myColor: Color;
    chess: Chess;
    id: number,
    player1Time: number,
    player2Time: number,
}) {
    const [from, setFrom] = useState<Square | null>(null);
    const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 1000 / 60).toString().padStart(2, '0');
        const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const isSelected = (square: Square | undefined) => from === square;

    const handleClick = (toSquare: Square) => {
        if (chess.turn() !== myColor) return;

        if (!from) {
            setFrom(toSquare);
        } else {
            const piece = chess.get(from);
            const isPawn = piece?.type === 'p';
            const isPromotionRank = (piece?.color === 'w' && toSquare[1] === '8') || (piece?.color === 'b' && toSquare[1] === '1');

            if (isPawn && isPromotionRank) {
                setPromotion({ from, to: toSquare });
            } else {
                socket.send(JSON.stringify({
                    type: "move",
                    payload: { move: { from, to: toSquare }, id }
                }));
                setFrom(null);
            }
        }
    };

    useEffect(() => {}, [socket, board, myColor, chess, player1Time, player2Time]);

    return (
        <div className="text-white flex flex-col text-xl rounded-md">
            <div className="bg-gray-800 px-4 py-2 w-24 text-center rounded-t-md">
                {myColor === "w" ? formatTime(player2Time) : formatTime(player1Time)}
            </div>

            {myColor === "w" && board.reverse().map((row, i) => (
                <div key={i} className="flex">
                    {row.map((square, j) => {
                        const toSquare = `${String.fromCharCode(97 + j)}${8 - i}`;
                        const isLight = (i + j) % 2 === 0;
                        return (
                            <motion.div
                                layout
                                key={j}
                                onClick={() => handleClick(toSquare as Square)}
                                className={`md:w-14 md:h-14 lg:w-16 lg:h-16 w-12 h-12 transition-colors duration-200 ${isLight ? "bg-green-100" : "bg-green-600"} ${isSelected(square?.square) ? "ring-4 ring-yellow-400" : ""}`}
                            >
                                <div className="relative flex justify-center items-center text-black w-full h-full">
                                    {square && (
                                        <motion.div layoutId={`${square.color}${square.type}-${square.square}`}>
                                            <Image src={`/${square.color}${square.type}.png`} alt={`${square.color}${square.type}`} width={100} height={100} />
                                        </motion.div>
                                    )}
                                    {i === 7 && (
                                        <p className="absolute left-1 bottom-0.5 text-gray-700 text-xs">{String.fromCharCode(97 + j)}</p>
                                    )}
                                    {j === 0 && (
                                        <p className="absolute left-1 top-0.5 text-gray-700 text-xs">{8 - i}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}

            {myColor === "b" && board.map((row, i) => (
                <div key={i} className="flex">
                    {row.map((square, j) => {
                        const toSquare = `${String.fromCharCode(97 + j)}${i + 1}`;
                        const isLight = (i + j) % 2 === 1;
                        return (
                            <motion.div
                                layout
                                key={j}
                                onClick={() => handleClick(toSquare as Square)}
                                className={`md:w-14 md:h-14 lg:w-16 lg:h-16 w-12 h-12 transition-colors duration-200 ${isLight ? "bg-green-100" : "bg-green-600"} ${isSelected(square?.square) ? "ring-4 ring-yellow-400" : ""}`}
                            >
                                <div className="relative flex justify-center items-center text-black w-full h-full">
                                    {square && (
                                        <motion.div layoutId={`${square.color}${square.type}-${square.square}`}>
                                            <Image src={`/${square.color}${square.type}.png`} alt={`${square.color}${square.type}`} width={100} height={100} />
                                        </motion.div>
                                    )}
                                    {i === 7 && (
                                        <p className="absolute left-1 bottom-0.5 text-gray-500 text-xs">{String.fromCharCode(97 + j)}</p>
                                    )}
                                    {j === 0 && (
                                        <p className="absolute left-1 top-0.5 text-gray-500 text-xs">{i + 1}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}

            <div className="bg-gray-800 px-4 py-2 rounded-b-md text-xl w-24 text-center">
                {myColor === "b" ? formatTime(player2Time) : formatTime(player1Time)}
            </div>

            {promotion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-md flex gap-4">
                        {['q', 'r', 'b', 'n'].map(p => (
                            <div key={p}
                                onClick={() => {
                                    socket.send(JSON.stringify({
                                        type: "move",
                                        payload: {
                                            move: { from: promotion.from, to: promotion.to, promotion: p },
                                            id
                                        }
                                    }));
                                    setPromotion(null);
                                    setFrom(null);
                                }}
                                className="cursor-pointer hover:scale-110 transition-transform"
                            >
                                <Image src={`/${myColor}${p}.png`} alt={p} width={60} height={60} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
