/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
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
          What is the capital of France?
        </h2>
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
                Berlin
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
                London
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
                Paris
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
                Rome
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
