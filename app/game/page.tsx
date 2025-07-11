import { getServerSession } from "next-auth";
import GameComponent from "../component/Game";
import { authOptions } from "../lib/authOptions";

export default async function Game() {

  const session = await getServerSession(authOptions);

  return (
    <div className="w-full h-screen flex gap-5 items-center justify-center">
      <GameComponent session={session}></GameComponent>
    </div>
  )
}
