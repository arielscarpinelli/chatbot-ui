import { pipeline } from "@huggingface/transformers"

export async function generateLocalEmbedding(content: string) {
  const model =
    process.env.LOCAL_EMBEDDINGS_MODEL ||
    "Snowflake/snowflake-arctic-embed-l-v2.0"

  const options = process.env.LOCAL_EMBEDDINGS_OPTIONS
    ? JSON.parse(process.env.LOCAL_EMBEDDINGS_OPTIONS)
    : { dtype: "fp32", use_external_data_format: true }

  const dimension = process.env.LOCAL_EMBEDDINGS_DIMENSION
    ? parseInt(process.env.LOCAL_EMBEDDINGS_DIMENSION)
    : 1024

  const generateEmbedding = await pipeline("feature-extraction", model, options)

  const output = await generateEmbedding(content, {
    pooling: "mean",
    normalize: true
  })

  const embedding = Array.from(output.data)

  if (embedding.length !== dimension) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${dimension}, but got ${embedding.length}.`
    )
  }

  return embedding
}
