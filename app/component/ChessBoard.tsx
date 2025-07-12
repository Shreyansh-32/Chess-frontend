"use client";

import { Chess, Color, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Equal, Flag } from 'lucide-react';

export default function ChessBoard({
  board,
  socket,
  myColor,
  chess,
  id,
  player1Time,
  player2Time,
  player1Name,
  player2Name,
}: {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
  myColor: Color;
  chess: Chess;
  id: number;
  player1Time: number;
  player2Time: number;
  player1Name: string | undefined;
  player2Name: string | undefined;
}) {
  const [from, setFrom] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [kingInCheckSquare, setKingInCheckSquare] = useState<Square | null>(null);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60).toString().padStart(2, "0");
    const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const isSelected = (square: Square | undefined) => from === square;

  const handleClick = useCallback(
    (toSquare: Square) => {
      if (chess.turn() !== myColor) {
        setFrom(null);
        return;
      }

      if (!from) {
        const clickedPiece = chess.get(toSquare);
        if (clickedPiece && clickedPiece.color === myColor) {
          setFrom(toSquare);
        } else {
          setFrom(null);
        }
      } else {
        const piece = chess.get(from);
        const isPawn = piece?.type === "p";
        const isPromotionRank =
          (piece?.color === "w" && toSquare[1] === "8") ||
          (piece?.color === "b" && toSquare[1] === "1");

        if (isPawn && isPromotionRank) {
          setPromotion({ from, to: toSquare });
        } else {
          socket.send(
            JSON.stringify({
              type: "move",
              payload: { move: { from, to: toSquare }, id },
            })
          );
          setFrom(null);
        }
      }
    },
    [chess, myColor, from, socket, id]
  );

  const checkSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("/Check.mp3") : null), []);

  useEffect(() => {
    if (chess.isGameOver()) {
      setKingInCheckSquare(null);
      return;
    }

    if (chess.inCheck()) {
      const colorInCheck = chess.turn();
      let kingSquare: Square | null = null;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const squareContent = board[r][c];
          if (squareContent?.type === "k" && squareContent.color === colorInCheck) {
            kingSquare = squareContent.square;
            break;
          }
        }
        if (kingSquare) break;
      }

      if (kingSquare) {
        checkSound?.play();
        setKingInCheckSquare(kingSquare);
      }
    } else {
      setKingInCheckSquare(null);
    }
  }, [board, chess, checkSound]);

  const renderedBoard = useMemo(() => {
    const boardToRender = myColor === "w" ? board : [...board].reverse().map((row) => [...row].reverse());

    return boardToRender.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((square, colIndex) => {
          const file = myColor === "w" ? String.fromCharCode(97 + colIndex) : String.fromCharCode(104 - colIndex);
          const rank = myColor === "w" ? 8 - rowIndex : rowIndex + 1;
          const squareCoordinate = `${file}${rank}` as Square;

          const fileIndex = squareCoordinate.charCodeAt(0) - "a".charCodeAt(0);
          const rankIndex = parseInt(squareCoordinate[1]) - 1;
          const isLight = (fileIndex + rankIndex) % 2 !== 0;

          const isBottomRow = rowIndex === 7;
          const isLeftColumn = colIndex === 0;
          const isCheckSquare = squareCoordinate === kingInCheckSquare;
          const labelColorClass = isLight ? "text-green-700" : "text-green-100";

          return (
            <motion.div
              layout
              key={squareCoordinate}
              onClick={() => handleClick(squareCoordinate)}
              className={`md:w-14 md:h-14 lg:w-16 lg:h-16 w-12 h-12 transition-colors duration-200
                ${isLight ? "bg-green-100" : "bg-green-600"}
                ${isSelected(squareCoordinate) ? "border-3 border-amber-400" : ""}
                ${isCheckSquare ? "bg-red-500" : ""}
                relative flex justify-center items-center`}
            >
              {square && (
                <motion.div layoutId={`${square.color}${square.type}-${square.square}`}>
                  <Image
                    src={`/${square.color}${square.type}.png`}
                    alt={`${square.color}${square.type}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
              {isBottomRow && (
                <p className={`absolute left-1 bottom-0.5 text-xs font-bold select-none ${labelColorClass}`}>
                  {file}
                </p>
              )}
              {isLeftColumn && (
                <p className={`absolute left-1 top-0.5 text-xs font-bold select-none ${labelColorClass}`}>
                  {rank}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    ));
  }, [board, myColor, from, kingInCheckSquare, handleClick]);

  const handleResign = () => {
    socket.send(JSON.stringify({
        type : "resign",
        payload:{
            id : id
        }
    }));
  }

  const handleDraw = () => {
    socket.send(JSON.stringify({
        type : "draw",
        payload:{
            id : id
        }
    }));
  }

  return (
    <div className="text-white flex flex-col text-xl rounded-md overflow-hidden shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 text-center flex justify-between items-center rounded-t-md">
        <h4 className="font-semibold">{myColor === "w" ? player2Name : player1Name}</h4>
        <div className="flex gap-4">
            <h4 className="font-mono">{myColor === "w" ? formatTime(player2Time) : formatTime(player1Time)}</h4>
        </div>
      </div>

      <div>{renderedBoard}</div>

      <div className="bg-gray-800 px-4 py-2 rounded-b-md text-xl flex justify-between items-center">
        <h4 className="font-semibold">{myColor === "w" ? player1Name : player2Name}</h4>
        <div className="flex gap-4">
            <div className="flex gap-2 items-center">
                <Flag  className="cursor-pointer" onClick={handleResign}/>
                <Equal className="cursor-pointer" onClick={handleDraw}/>
            </div>
            <h4 className="font-mono">{myColor === "w" ? formatTime(player1Time) : formatTime(player2Time)}</h4>
        </div>
      </div>

      {promotion && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-xl flex gap-4 border border-gray-600">
            <h3 className="text-white text-lg mr-4 self-center">Promote to:</h3>
            {["q", "r", "b", "n"].map((p) => (
              <div
                key={p}
                onClick={() => {
                  socket.send(
                    JSON.stringify({
                      type: "move",
                      payload: {
                        move: { from: promotion.from, to: promotion.to, promotion: p },
                        id,
                      },
                    })
                  );
                  setPromotion(null);
                  setFrom(null);
                }}
                className="cursor-pointer p-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
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
