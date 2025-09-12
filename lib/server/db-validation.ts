import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"

export async function validateDbSchema() {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Validate embedding dimension
  const configuredDimension = process.env.LOCAL_EMBEDDINGS_DIMENSION
    ? parseInt(process.env.LOCAL_EMBEDDINGS_DIMENSION)
    : 1024

  const { data: dimensionData, error: dimensionError } = await supabaseAdmin
    .rpc("sql", {
      sql: `
        SELECT atttypmod
        FROM pg_attribute
        WHERE attrelid = 'public.file_items'::regclass
          AND attname = 'local_embedding';
      `
    })

  if (dimensionError) {
    console.error("CRITICAL: Error fetching embedding dimension from the database.", dimensionError)
    throw new Error("Could not validate the database schema against the configured embedding dimension.")
  }

  const dbDimension = dimensionData?.[0]?.atttypmod
  if (dbDimension !== configuredDimension) {
    console.error(
      `CRITICAL: Database schema validation failed. The 'local_embedding' column in 'file_items' has a dimension of ${dbDimension}, but the configured dimension is ${configuredDimension}.`
    )
    throw new Error("Database and configured embedding dimensions do not match.")
  }

  // 2. Check for other tables with local_embedding column
  const { data: otherTablesData, error: otherTablesError } = await supabaseAdmin
    .rpc("sql", {
      sql: `
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'local_embedding' AND table_name != 'file_items';
      `
    })

  if (otherTablesError) {
    console.warn("Warning: Could not check for other tables with 'local_embedding' column.", otherTablesError)
  }

  if (otherTablesData && otherTablesData.length > 0) {
    const tableNames = otherTablesData.map((row: any) => row.table_name).join(", ")
    console.warn(
      `Warning: Found other tables with a 'local_embedding' column: ${tableNames}. This may cause unexpected behavior if the dimensions do not match.`
    )
  }
}
