/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { BASE_URL } from '@/app/api-service-config'
import { getFrameSession, getQuestions } from '@/app/mongo/frame-session'
import { Question } from '@/app/game-domain/question'
import styles from './route.module'

const app = new Frog({
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

const getOptions = (questions: Question[], index: number) => {
  return questions.length > 0 && questions[index] &&
    questions[index].options ? questions[index].options : []
}

const getOptionText = (questions: Question[], index: number, optionIndex: number) => {
  const option = questions?.[index]?.options?.[optionIndex];
  return option ? option : '';
};

app.frame('/trivia/session/:sessionId/user/:userId', async (c) => {
  const { status } = c
  const { sessionId } = c.req.param()
  console.log('base url', BASE_URL)

  let frameSession;
  let questions = [] as Question[];
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
      <div
        style={styles.container}
      >
        <h2
          style={styles.question}
        >
          {getQuestion(questions, 0)}
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
              {getOptionText(questions, 0, 0)}
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
              {getOptionText(questions, 0, 1)}
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
              {getOptionText(questions, 0, 2)}
            </p>
          </div>
          {getOptionText(questions, 0, 3) && <div
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
              {getOptionText(questions, 0, 3)}
            </p>
          </div>}
        </div>
      </div>

    ),
    intents: [
      <TextInput placeholder="Enter custom fruit..." />,
      <Button value="apples">Apples</Button>,
      <Button value="oranges">Oranges</Button>,
      <Button value="bananas">Bananas</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
