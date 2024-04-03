/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { BASE_URL } from '@/app/api-service-config'
import { getFrameSession, getQuestions } from '@/app/mongo/frame-session'
import { Question } from '@/app/game-domain/question'

const app = new Frog({
  assetsPath: '/',
  basePath: '/trivia',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const getQuestion = (questions: Question [], index: number) => {
  return questions.length > 0 && questions[index] ? 
  `${questions[index].question}` : 'empty'
}

const getOptions = (questions: Question [], index: number) => {
  return questions.length > 0 && questions[index] && 
    questions[index].options ? questions[index].options : []
}

app.frame('/trivia/session/:sessionId/user/:userId', async (c) => {
  const { status } = c
  const { sessionId } = c.req.param()
  console.log('base url', BASE_URL)

  let frameSession;
  let questions = [] as Question[];
  try{
    frameSession = await getFrameSession(sessionId);
    console.log('frame session: ', frameSession)

    if (!frameSession) {
      console.log('No frame session found')
    }

    // Get questions given the metaphor id
    questions = await getQuestions(frameSession.metaphor_id);
  }
  catch(e){
    console.log('error', e)
  }
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "600",
            color: "white",
          }}
        >
          {getQuestion(questions, 0)}
        </h2>s
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'flex-start',
            justifyItems: 'start',
            paddingLeft: '30%',
            gridGap: "4",
          }}
        >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "2",
              }}
            >
              <div
                style={{
                  backgroundColor: "lightgreen",
                  border: "1px solid #E5E7EB",
                  borderColor: "#E5E7EB",
                  borderRadius: "9999px",
                  display: "flex",
                  height: "1rem",
                  width: "1rem",
                }}
              />
              <p
                style={{
                  fontSize: "2rem",
                  color: "white",
                  paddingLeft: "0.5rem",

                }}
              >
                { getOptions(questions, 0)[0] }
              </p>
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "2",
              }}
            >
              <div
                style={{
                  backgroundColor: "#EF4444",
                  border: "1px solid #E5E7EB",
                  borderColor: "#E5E7EB",
                  borderRadius: "9999px",
                  display: "flex",
                  height: "1rem",
                  width: "1rem",
                }}
              />
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "white",
                }}
              >
                { getOptions(questions, 0)[1] }
              </p>
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "2",
              }}
            >
              <div
                style={{
                  backgroundColor: "#3B82F6",
                  border: "1px solid #E5E7EB",
                  borderColor: "#E5E7EB",
                  borderRadius: "9999px",
                  display: "flex",
                  height: "1rem",
                  width: "1rem",
                }}
              />
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "white",
                }}
              >
                {getOptions(questions, 0)[2]}
              </p>
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "2",
              }}
            >
              <div
                style={{
                  backgroundColor: "#F59E0B",
                  border: "1px solid #E5E7EB",
                  borderColor: "#E5E7EB",
                  display: "flex",
                  borderRadius: "9999px",
                  height: "1rem",
                  width: "1rem",
                }}
              />
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "white",
                }}
              >
                {getOptions(questions, 0)[2]}
              </p>
          </div>
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
