/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { getFrameSession, getQuestions } from '@/app/mongo/frame-session'
import { Question } from '@/app/game-domain/question'
import styles from './route.module'
import { FrameSession } from '@/app/game-domain/frame-session'
import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import { mintCompressedNFT } from '@/app/solana/mint'
import * as envEnc from "@chainlink/env-enc";
import { neynar } from 'frog/hubs'

envEnc.config();

type State = {
  questionIndex: number
  gameState: 'initial' | 'playing' | 'finished'
  questions: Question[]
  correctAnswers: number
  numberOfQuestions: number
  frameSession: FrameSession
}

const app = new Frog<{ State: State }>({
  initialState: {
    questionIndex: 0,
    correctAnswers: 0,
    gameState: 'initial',
    questions: [],
    numberOfQuestions: 0,
    frameSession: {} as FrameSession
  },
  assetsPath: '/',
  basePath: '/trivia',
  // Supply a Hub to enable frame verification.
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY ?? '' }),
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const getQuestion = (questions: Question[], index: number) => {
  return questions.length > 0 && questions[index] ?
    `${questions[index].question}` : 'empty'
}

const isCorrectAnswer = (questions: Question[], index: number, optionPicked: number) => {
  if (questions && questions.length > 0 &&
    questions[index] &&
    questions[index].options) {

    const optionPickedValue = questions[index].options[optionPicked];
    questions[index].player_answer = optionPickedValue;
    // console.log('Answer:', questions[index].answer)
    // console.log('Option picked:', questions[index].options[optionPicked])
    return optionPickedValue === questions[index].answer
  }
  return false
}

const getOptions = (questions: Question[], index: number) => {
  return questions.length > 0 && questions[index] &&
    questions[index].options ? questions[index].options : []
}

const getOptionText = (questions: Question[], index: number, optionIndex: number) => {
  const option = questions?.[index]?.options?.[optionIndex];
  return option ? option : '';
};

const footer = (state: State, session?: FrameSession) => {
  return <p style={styles.footer}>Question {state.questionIndex + 1} / {session?.numberOfQuestions}</p>
}

const questionHtml = (state: State, questions: Question[], session?: FrameSession) => {
  return (
    <div
      style={styles.container}
    >
      <h2
        style={styles.question}
      >
        {getQuestion(questions, state.questionIndex)}
      </h2>
      <div
        style={styles.optionsContainer}
      >
        <div
          style={styles.option}
        >
          <div
            style={{
              ...styles.optionIndicator,
              backgroundColor: "lightgreen",
            }}
          />
          <p
            style={styles.optionText}
          >
            {getOptionText(questions, state.questionIndex, 0)}
          </p>
        </div>
        <div
          style={styles.option}
        >
          <div
            style={{
              ...styles.optionIndicator,
              backgroundColor: "#EF4444"
            }}
          />
          <p
            style={styles.optionText}
          >
            {getOptionText(questions, state.questionIndex, 1)}
          </p>
        </div>
        <div
          style={styles.option}
        >
          <div
            style={{
              ...styles.optionIndicator,
              backgroundColor: "#3B82F6",
            }}
          />
          <p
            style={styles.optionText}
          >
            {getOptionText(questions, state.questionIndex, 2)}
          </p>
        </div>
        {getOptionText(questions, state.questionIndex, 3) &&
          <div
            style={styles.option}
          >
            <div
              style={{
                ...styles.optionIndicator,
                backgroundColor: "#F59E0B"
              }}
            />
            <p
              style={styles.optionText}
            >
              {getOptionText(questions, state.questionIndex, 3)}
            </p>
          </div>}
      </div>
      {footer(state, session)}
    </div>
  )
}

const initialHtml = () => {
  return (
    <div
      style={{
        ...styles.initialContainer,
        backgroundImage: 'url(https://monkeytrivia.xyz/assets/images/bg.jpg)',
      }}
    >
      <div
        style={styles.initialBackgroundTextContainer}
      >
        <h1
          style={styles.header1}
        >
          Welcome to Monkey Trivia!
        </h1>

        <h1
          style={styles.header2}
        >
          Get ready to test your knowledge. Good luck! 🍀
        </h1>

        <h1
          style={styles.header2}
        >
          Press the "Next" button to start the game.
        </h1>
        <h1
          style={styles.header2}
        >
          You have 5 minutes to complete the game.
        </h1>
      </div>

    </div>
  )
}

const EndHtml = (state: State, session: FrameSession) => {
  return (
    <div
      style={{
        ...styles.initialContainer,
        backgroundImage: 'url(https://monkeytrivia.xyz/assets/images/bg.jpg)',
      }}
    >
      <div
        style={styles.initialBackgroundTextContainer}
      >
        <h1
          style={styles.header1}
        >
          Game Over!
        </h1>

        <h1
          style={styles.header2}
        >
          Score: {Math.floor(state.correctAnswers / session.numberOfQuestions * 100)}%
        </h1>

        <h1
          style={styles.header2}
        >
          blach blah blah
        </h1>
        <h1
          style={styles.header2}
        >
          blach blah blah
        </h1>
      </div>

    </div>
  )
}

app.frame('/session/:sessionId', async (c) => {
  const { status, buttonValue, frameData, deriveState } = c
  const { sessionId } = c.req.param()
  let frameSession: FrameSession = {} as FrameSession;
  let questions = [] as Question[];
  let solanaAddress = '';

  try {
    frameSession = await getFrameSession(sessionId);
    console.log('frame session: ', frameSession)
    // previousState.numberOfQuestions = previousState.frameSession.numberOfQuestions;
    if (!frameSession) {
      console.log('No frame session found')
    }
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY ?? "");

    console.log("api key:", process.env.NEYNAR_API_KEY)

    const fid = frameData?.fid ?? 1;

    const userBulkResponse = client.fetchBulkUsers([fid]);

    console.log('user bulk response:', (await userBulkResponse).users[0]);

    solanaAddress = (await userBulkResponse).users[0].verified_addresses.sol_addresses[0];

    console.log('Solana address:', solanaAddress);
    // Get questions given the metaphor id
    questions = await getQuestions(frameSession.metaphor_id);
  }
  catch (e) {
    console.log('error', e)
  }


  const state = deriveState((previousState: State) => {
    // if 0 <= buttonValue <= 3, check if the answer is correct
    if (buttonValue && ['0', '1', '2', '3'].includes(buttonValue)) {
      console.log("questions:", previousState.questions)
      if (isCorrectAnswer(previousState.questions, previousState.questionIndex, parseInt(buttonValue))) {
        previousState.questions[previousState.questionIndex].player_correct = true;
        previousState.correctAnswers++;
        console.log('Correct answer!')
      } else {
        previousState.questions[previousState.questionIndex].player_correct = false;
        previousState.questions[previousState.questionIndex].player_answer = previousState.questions[previousState.questionIndex].options[parseInt(buttonValue)];
        console.log('Incorrect answer!')
      }
      previousState.questionIndex++
    }
    else if (buttonValue === 'start') {
      previousState.gameState = 'playing';
      previousState.numberOfQuestions = frameSession.numberOfQuestions;
      previousState.frameSession = frameSession;
      previousState.questions = questions;
    }
    else if (status === 'initial') {
      previousState.gameState = 'initial';
      previousState.questionIndex = 0;
      previousState.correctAnswers = 0;
      previousState.numberOfQuestions = frameSession.numberOfQuestions;
      // console.log('frame session:', frameSession)
    }
    else if (buttonValue === 'mint') {
      // Mint NFT
      console.log('Minting NFT...');
      // make sure to set your NEYNAR_API_KEY .env
      const mintResult =  mintCompressedNFT(solanaAddress);
      mintResult.then((result) => {
        console.log('Mint result:', result);
        // create the following link https://xray.helius.xyz/token/E4xZPUPbce6LPzTNzd8gV5M7q4CykRxJztJi8uaEmWhT?network=devnet
        const tokenLink = `https://xray.helius.xyz/token/${result?.assetId ?? "none"}?network=devnet`;
        console.log('Token link:', tokenLink);
      }).catch((error) => {
        console.log('Mint error:', error)
      });

    }
  });

  const isGameActive = state.gameState === 'playing';
  const showChoice = isGameActive &&
    state.questionIndex < state.numberOfQuestions &&
    status !== 'initial';

  return c.res({
    image: (
      <div style={styles.mainContainer}>
        {status === 'initial' && initialHtml()}
        {status === 'response' && state.questionIndex < state.numberOfQuestions && questionHtml(state, state.questions, state.frameSession)}
        {status === 'response' && state.questionIndex >= state.numberOfQuestions && EndHtml(state, state.frameSession)}

      </div>
    ),
    intents: [
      status === 'response' && <Button.Reset >Reset</Button.Reset>,
      status === 'initial' && <Button value="start">Start</Button>,

      // Choices
      showChoice && <Button value="0">{getOptionText(state.questions, state.questionIndex, 0)}</Button>,
      showChoice && <Button value="1">{getOptionText(state.questions, state.questionIndex, 1)}</Button>,
      showChoice && <Button value="2">{getOptionText(state.questions, state.questionIndex, 2)}</Button>,
      <Button value="mint">Mint</Button>,
      showChoice && getOptionText(state.questions, state.questionIndex, 3).length > 0 && <Button value="3">{getOptionText(state.questions, state.questionIndex, 3)}</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
