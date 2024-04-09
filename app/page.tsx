import { getFrameMetadata } from 'frog/next'
import type { Metadata } from 'next'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/trivia`,
  )
  return {
    other: frameTags,
  }
}

export default function Home() {
  return (
    <main className={styles.main}>
        
    </main>
    // <CustomButton onClick={()=> {}}>Create Frame</CustomButton>
  )
}
