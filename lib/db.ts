import { neon } from "@neondatabase/serverless";

/**
 * Vercel 마켓플레이스로 연결한 Neon이 주입하는 환경변수를 사용한다.
 * (통합 설정에 따라 DATABASE_URL 또는 POSTGRES_URL 로 들어온다)
 */
function connectionString() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "Neon 연결 문자열이 없습니다. `vercel integration add neon` 후 `vercel env pull .env.local` 을 실행하세요.",
    );
  }
  return url;
}

type Sql = ReturnType<typeof neon>;

let _sql: Sql | null = null;

/** 빌드 타임에 터지지 않도록 지연 초기화한다. */
export function getSql(): Sql {
  if (!_sql) _sql = neon(connectionString());
  return _sql;
}

let schemaReady: Promise<void> | null = null;

/** 첫 쿼리 전에 한 번만 스키마를 보장한다. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = createSchema();
  return schemaReady;
}

async function createSchema() {
  const sql = getSql();

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      topic       text NOT NULL,
      title       text NOT NULL,
      difficulty  text NOT NULL,
      model       text NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id       uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      position      int  NOT NULL,
      prompt        text NOT NULL,
      choices       jsonb NOT NULL,
      answer_index  int  NOT NULL,
      explanation   text NOT NULL,
      UNIQUE (quiz_id, position)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attempts (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id     uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      nickname    text NOT NULL,
      score       int  NOT NULL,
      total       int  NOT NULL,
      elapsed_ms  int,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS attempts_quiz_score_idx ON attempts (quiz_id, score DESC, elapsed_ms ASC)`;
  await sql`CREATE INDEX IF NOT EXISTS quizzes_created_idx ON quizzes (created_at DESC)`;
}
