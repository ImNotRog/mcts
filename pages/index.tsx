import Head from 'next/head'
import { Inter, Roboto_Mono } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { MCTS, Connect } from '@/algo/mcts'

const inter = Inter({ subsets: ['latin'] })
const mono = Roboto_Mono({ subsets: ['latin'] })

type ComputationState = null | {
  iterations: number;
  policy: number[];
  eval: number;
}

const TRUNCATE = (a:number) => {
  let str = `${Math.floor(a*1000)}`;
  while(str.length < 3) str = '0' + str;
  return `.${str}`;
}

const COLOR = (a:number) => {
  if(a > 0) return styles.red;
  else return styles.yellow;
}

function Chip(props: { value: number, to_place?: boolean, onClick?: () => void, best?: boolean, player:number}) {

  if(props.value !== 0)
    return <div className={styles.divider}>
      <div className={`${styles.chip} ${COLOR(props.value)}`} />
    </div>
  else
    return <div className={styles.divider}>
      <div onClick={() => { if (props.onClick && props.to_place) props.onClick(); }} className={`${styles.chip} ${props.to_place ? `${styles.emptychiptoplace} ${COLOR(props.player)}` : styles.emptychip} ${props.best ? styles.best : ''}`} />
    </div>
}

export default function Home() {
  const [game_state, set_game_state] = useState<Connect>( new Connect() );
  const [computation_state, set_computation_state] = useState<ComputationState>( null );
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
      }
  }, [game_state,worker]);

  const MOVE = (i: number) => {
    if (game_state.is_terminal) return;
    if (!game_state.get_children()[i]) return;

    worker!.postMessage(i);
    set_game_state(game_state.get_children()[i]!);
    set_computation_state(null);
  }

  let BEST_MOVE = -1;
  let to_place = Array(game_state.board.length).fill(-1);
  if ( !game_state.is_terminal ) {
    for (let i = 0; i < game_state.board.length; i++) {
      let j = 0;
      while (j < game_state.board[i].length) {
        if (game_state.board[i][j] === 0) {
          to_place[i] = j;
          break;
        }
        j++;
      }
    }

    if(computation_state) {
      let max_i = 0;
      for (let i = 0; i < computation_state.policy.length; i++) {
        if(computation_state.policy[i] > computation_state.policy[max_i]) {
          max_i = i;
        }
      }
      BEST_MOVE = max_i;
    }
  }

  return (
    <>
      <Head>
        <title>MCTS Connect 4</title>
        <meta name="description" content="A crappy algorithm that works less crappy than expected." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>

        <div className={styles.burrito}>
          <div className={styles.board}>
            {game_state.board.map((a,i) => 
              <div key={i} className={styles.column}>

                <div className={styles.policy + ' ' + mono.className}>{TRUNCATE(computation_state ? computation_state?.policy[i] : 0)}</div>

                {a.map((b,j) => 
                  <Chip value={b} key={j + '-' + b} to_place={to_place[i] === j} best={BEST_MOVE === i && to_place[i] === j} onClick={() => MOVE(i)} player={game_state.player} />
                )}

              </div>
            )}
          </div>
          <div className={mono.className}>Move Confidence</div>
        </div>
        
        <div>{!!computation_state && computation_state.eval}</div>
        <div>{!!computation_state && computation_state.policy.map(a => Math.floor(a * 1000)/1000).join(' | ')}</div>
        <div>{!!computation_state && computation_state.iterations}</div>
        
      </main>
    </>
  )
}
