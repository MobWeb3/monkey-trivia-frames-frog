/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
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

// const getOptions = (questions: Question[], index: number) => {
//   return questions.length > 0 && questions[index] &&
//     questions[index].options ? questions[index].options : []
// }

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
  const { status, deriveState, buttonValue } = c
  const { sessionId } = c.req.param()
  let frameSession;
  let questions = [] as Question[];

  const state = deriveState(previousState => {
    if (buttonValue === 'prev' && previousState.questionIndex > 0) {
      previousState.questionIndex--
    }
    if (buttonValue === 'next') previousState.questionIndex++
    if (buttonValue === 'start') previousState.questionIndex = 0
  })

  try {
    frameSession = await getFrameSession(sessionId);
    console.log('frame session: ', frameSession)

    if (!frameSession) {
      console.log('No frame session found')
    }

    // Get questions given the metaphor id
    questions = await getQuestions(frameSession.metaphor_id);
  }
  catch (e) {
    console.log('error', e)
  }
  return c.res({
    image: (
      <div style={styles.mainContainer}>
        {status === 'initial' && initialHtml()}
        {status === 'response' && questionHtml(state, questions, frameSession)}

      </div>
    ),
    intents: [
      state.questionIndex > 0 && <Button value="prev">Previous</Button>,
      frameSession &&
      (state.questionIndex < frameSession?.numberOfQuestions - 1) &&
      status !== 'initial' && <Button value="next">Next</Button>,
      // <Button value="bananas">Bananas</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
      status === 'initial' && <Button value="start">Start</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
