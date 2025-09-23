export async function generateLocalEmbedding(content: string) {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/Snowflake/snowflake-arctic-embed-l-v2.0/pipeline/feature-extraction",
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: content })
    }
  )
  const result = await response.json()
  return result
}
