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
  const [eval_on, set_eval_on] = useState<boolean>(true);
  const [auto_p1, set_auto_p1] = useState<boolean>(false);
  const [auto_p2, set_auto_p2] = useState<boolean>(false);

  const find_best_move = () => {
    let BEST_MOVE = -1;
    if (!game_state.is_terminal) {
      if (computation_state) {
        let max_i = 0;
        for (let i = 0; i < computation_state.policy.length; i++) {
          if (computation_state.policy[i] > computation_state.policy[max_i]) {
            max_i = i;
          }
        }
        BEST_MOVE = max_i;
      }
    }
    return BEST_MOVE;
  }

  const MOVE = (i: number) => {
    if (game_state.is_terminal) return;
    if (!game_state.get_children()[i]) return;

    worker!.postMessage(i);
    set_game_state(game_state.get_children()[i]!);
    set_computation_state({ iterations: 0, policy: Array(game_state.board.length).fill(0), eval: computation_state ? computation_state.eval : 0 });
  }

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

            if ((auto_p1 && game_state.player === 1) || (auto_p2 && game_state.player === -1)) {
              if(res.iterations >= 2000) {
                if (!game_state.is_terminal) { 
                  let best_move = 0;
                  for (let i = 0; i < res.policy.length; i++) {
                    if (res.policy[i] > res.policy[best_move]) {
                      best_move = i;
                    }
                  }
                  MOVE(best_move);
                }
              }
            }
          }

        }
      }
  }, [game_state,worker,auto_p1,auto_p2]);

  let BEST_MOVE = find_best_move();
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
  }


  const eval_style = eval_on ? { } : { opacity: 0 };

  return (
    <>
      <Head>
        <title>MCTS Connect 4</title>
        <meta name="description" content="A crappy algorithm that works less crappy than expected." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={mono.className}>

        <div className={styles.burrito}>
          <div className={styles.board}>
            <div style={eval_style} className={`${styles.evalburrito} ${game_state.player === 1 ? styles.red : ''}`}>
              <div className={`${styles.eval} ${game_state.player === -1 ? styles.yellow : ''}`} style={{ height: `${computation_state ? 50*(1-computation_state.eval) : 50}%` }} />
            </div>
            {game_state.board.map((a,i) => 
              <div key={i} className={styles.column}>

                <div style={eval_style} className={styles.policy + ' ' + mono.className}>{TRUNCATE(computation_state ? computation_state?.policy[i] : 0)}</div>

                {a.map((b,j) => 
                  <Chip value={b} key={j + '-' + b} to_place={to_place[i] === j} best={BEST_MOVE === i && to_place[i] === j && eval_on} onClick={() => MOVE(i)} player={game_state.player} />
                )}

              </div>
            )}
          </div>
          <div style={eval_style}>Move Confidence</div>
          <div style={{marginTop: '1rem'}}>There have been {computation_state ? computation_state.iterations : 0} iterations. (Generally wait until 2000.)</div>

          <div className={styles.lonk} onClick={() => set_eval_on(!eval_on)}>Eval: {eval_on ? 'On' : 'Off'}</div>
          <div className={styles.lonk} onClick={() => set_auto_p1(!auto_p1)}>Auto Move Player 1 (Red): { auto_p1 ? 'On' : 'Off' }</div>
          <div className={styles.lonk} onClick={() => set_auto_p2(!auto_p2)}>Auto Move Player 2 (Yellow): {auto_p2 ? 'On' : 'Off'}</div>
        </div>
        
      </main>
    </>
  )
}
