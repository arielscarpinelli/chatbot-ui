import { pipeline } from "@huggingface/transformers"

export async function generateLocalEmbedding(content: string) {
  const generateEmbedding = await pipeline(
    "feature-extraction",
    "Snowflake/snowflake-arctic-embed-l-v2.0",
    { dtype: "fp32", use_external_data_format: true }
  )

  const output = await generateEmbedding(content, {
    pooling: "mean",
    normalize: true
  })

  const embedding = Array.from(output.data)

  return embedding
}
