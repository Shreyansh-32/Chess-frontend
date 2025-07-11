import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from './lib/authOptions';
import PlayNowButton from './component/PlayNowButton';

const ChessLandingPage = async() => {

  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=400&fit=crop&crop=center"
                alt="Chess board with pieces"
                className="w-80 h-80 object-cover rounded-lg shadow-2xl border-4 border-amber-600"
              />
              <div className="absolute inset-0 bg-amber-400 opacity-20 blur-xl -z-10 rounded-lg"></div>
            </div>
          </div>
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Master the
                <span className="text-amber-400 block">Game of Kings</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-md mx-auto lg:mx-0">
                Challenge players worldwide in the ultimate strategy game. 
                Sharpen your skills and rise through the ranks.
              </p>
            </div>
            <div className="flex justify-center lg:justify-start">
              <PlayNowButton session={session}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessLandingPage;