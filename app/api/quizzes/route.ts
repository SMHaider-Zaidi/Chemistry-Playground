// app/api/quizzes/route.ts
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Standard MySQL pool connection configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'chemistry_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classLevel = searchParams.get('class_level')
  const chapterId = searchParams.get('chapter_id')

  try {
    // 1. Fetch specific chapter questions if chapter_id is supplied
    if (chapterId) {
      const [questions]: any = await pool.query(
        `SELECT id, question_text AS question, option_a, option_b, option_c, option_d, 
                correct_option, explanation, difficulty, topic 
         FROM questions WHERE chapter_id = ?`,
        [chapterId]
      )

      // Map DB schema to match UI expectations
      const formattedQuestions = questions.map((q: any) => ({
        id: String(q.id),
        type: 'multiple-choice',
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correct_option),
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        topic: q.topic || 'General',
      }))

      return NextResponse.json({ questions: formattedQuestions })
    }

    // 2. Otherwise fetch all chapters with question counts
    const [chapters]: any = await pool.query(
      `SELECT c.id, c.chapter_number, c.title, c.class_level, 
              COUNT(q.id) AS question_count
       FROM chapters c
       LEFT JOIN questions q ON c.id = q.chapter_id
       ${classLevel ? 'WHERE c.class_level = ?' : ''}
       GROUP BY c.id
       ORDER BY c.class_level ASC, c.chapter_number ASC`,
      classLevel ? [classLevel] : []
    )

    return NextResponse.json({ chapters })
  } catch (error: any) {
    console.error('Database Error:', error)
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }
}