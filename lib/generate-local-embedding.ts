import { pipeline } from "@xenova/transformers"

export async function generateLocalEmbedding(content: string) {
  const generateEmbedding = await pipeline(
    "feature-extraction",
    "Snowflake/snowflake-arctic-embed-l-v2.0",
    // @ts-ignore
    { dtype: "fp32", use_external_data_format: true }
  )

  const output = await generateEmbedding(content, {
    pooling: "mean",
    normalize: true
  })

  const embedding = Array.from(output.data)

  return embedding
}
