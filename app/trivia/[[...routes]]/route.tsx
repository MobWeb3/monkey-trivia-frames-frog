/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { getFrameSession, getQuestions } from '@/app/mongo/frame-session'
import { Question } from '@/app/game-domain/question'
import styles from './route.module'
import { FrameSession } from '@/app/game-domain/frame-session'

type State = {
  questionIndex: number
  gameState: 'initial' | 'playing' | 'finished'
}

const app = new Frog<{ State: State }>({
  initialState: {
    questionIndex: 0
  },
  assetsPath: '/',
  basePath: '/trivia',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
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
    questions[index].options ) {
    // console.log('Answer:', questions[index].answer)
    // console.log('Option picked:', questions[index].options[optionPicked])
    return questions[index].options[optionPicked] === questions[index].answer
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

app.frame('/trivia/session/:sessionId/user/:userId', async (c) => {
  const { status, buttonValue } = c
  const { sessionId } = c.req.param()
  let frameSession;
  let questions = [] as Question[];

  let state: State = c.previousState

  // if status is initial, show the initial screen and reset the question index
  // and gameState
  if (status === 'initial') {
    console.log('status: ', status)
    // state = deriveState(previousState => {
    state.questionIndex = 0
    state.gameState = 'initial'
    // })
  }

  // console.log('frameData:', frameData)
  // console.log('previousButtonValues:', c.previousButtonValues)

  try {
    frameSession = await getFrameSession(sessionId);
    // console.log('frame session: ', frameSession)

    if (!frameSession) {
      console.log('No frame session found')
    }

    // Get questions given the metaphor id
    questions = await getQuestions(frameSession.metaphor_id);
  }
  catch (e) {
    console.log('error', e)
  }


  // if 0 <= buttonValue <= 3, check if the answer is correct
  if (buttonValue && ['0', '1', '2', '3'].includes(buttonValue)) {
    // console.log("questiions:", questions)
    if (isCorrectAnswer(questions, state.questionIndex, parseInt(buttonValue))) {
      console.log('Correct answer!')
    } else {
      console.log('Incorrect answer!')
    }
    state.questionIndex++
  }


  if (buttonValue === 'prev' && state.questionIndex > 0) {
    state.questionIndex--
  }
  if (buttonValue === 'next') state.questionIndex++
  if (buttonValue === 'start') state.gameState = 'playing'
  if (buttonValue === '_c') {
    state.questionIndex = 0
    state.gameState = 'initial'
    console.log('Reset game');
  }

  console.log('buttonValue:', buttonValue)

  const isGameActive = state.gameState === 'playing';


  return c.res({
    image: (
      <div style={styles.mainContainer}>
        {status === 'initial' && initialHtml()}
        {status === 'response' && questionHtml(state, questions, frameSession)}

      </div>
    ),
    intents: [
      status === 'response' && <Button.Reset >Reset</Button.Reset>,
      status === 'initial' && <Button value="start">Start</Button>,

      // Choices
      isGameActive && <Button value="0">{getOptionText(questions, state.questionIndex, 0)}</Button>,
      isGameActive && <Button value="1">{getOptionText(questions, state.questionIndex, 1)}</Button>,
      isGameActive && <Button value="2">{getOptionText(questions, state.questionIndex, 2)}</Button>,
      getOptionText(questions, state.questionIndex, 3).length > 0 && <Button value="3">{getOptionText(questions, state.questionIndex, 3)}</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
