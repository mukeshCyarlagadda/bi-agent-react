// Mirror of FastAPI Pydantic models — keep snake_case throughout.

// ── Connection ───────────────────────────────────────────────────────────────

export type DbType =
  | 'sqlite' | 'postgres' | 'mysql' | 'mssql'
  | 'snowflake' | 'bigquery' | 'oracle' | 'duckdb'

export interface ConnectRequest {
  db_type: DbType
  db_path?: string
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  account?: string
  warehouse?: string
  schema_?: string
  project?: string
  dataset?: string
  credentials_path?: string
  sid?: string
}

export interface ConnectResponse {
  session_id: string
  db_type: string
  tables: string[]
  message: string
}

// ── Query ────────────────────────────────────────────────────────────────────

export interface QueryRequest  { question: string }
export interface ApproveRequest { approved: boolean }

export interface TableResult {
  table_name: string
  dataframe?: Record<string, unknown[]>
  sql_statement?: string
  error?: string
}

export type ResultType =
  | 'table' | 'multi_table' | 'chart' | 'table_and_chart'
  | 'error' | 'message' | 'pending_approval'

export interface QueryResponse {
  sql_query?:       string
  result_type:      ResultType
  dataframe?:       Record<string, unknown>[]
  multi_table_data?: TableResult[]
  chart_html?:      string
  error?:           string
  message?:         string
  // HITL
  pending_sql?:     string
  pending_is_ddl?:  boolean
  pending_reason?:  string
}

// ── Client-side chat model ───────────────────────────────────────────────────

export interface ChatEntry {
  id:        string
  question:  string
  response?: QueryResponse   // undefined while pending
  pending:   boolean
  timestamp: Date
  isSystem?: boolean         // true = connection/disconnect event, no user bubble
}
