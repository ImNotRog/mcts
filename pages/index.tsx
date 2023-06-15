import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { MCTS, Connect } from '@/algo/mcts'

const inter = Inter({ subsets: ['latin'] })

type ComputationState = {
  iterations: number;
  policy: number[];
  eval: number;
}

export default function Home() {
  const [game_state, set_game_state] = useState<Connect>( new Connect() );
  const [computation_state, set_computation_state] = useState<ComputationState>( {iterations: 0, policy: Array(7).fill(0), eval: 0} );
  const [worker, set_worker] = useState<Worker>();

  useEffect(() => {

    const work = new Worker("worker.js");
    set_worker(work);
  
    return () => { work.terminate(); set_worker(undefined); };
  }, []);

  useEffect(() => {
    if(worker)
      worker.onmessage = (e) => {
        const res: { type: string, policy: number[], board: number[][], eval: number, iterations: number } = e.data;

        if (res.type === 'computation') {

          if (game_state.board.every((a, i) => a.every((b, j) => b === res.board[i][j]))) {
            set_computation_state({
              iterations: res.iterations,
              eval: res.eval,
              policy: res.policy
            })
          }

        }
        console.log(res.board, game_state.board)
      }
  }, [game_state,worker]);

  const MOVE = (i: number) => {
    worker!.postMessage(i);
    set_game_state(game_state.get_children()[i]!);
  }

  return (
    <>
      <Head>
        <title>MCTS Connect 4</title>
        <meta name="description" content="A crappy algorithm that works less crappy than expected." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {Array(7).fill(0).map((_, i) => <button key={i} onClick={() => { MOVE(i) }}>{i+1}</button>)}
        
        <div>{!!computation_state && computation_state.eval}</div>
        <div>{!!computation_state && computation_state.policy.map(a => Math.floor(a * 1000)/1000).join(' | ')}</div>
        <div>{!!computation_state && computation_state.iterations}</div>
        
      </main>
    </>
  )
}
