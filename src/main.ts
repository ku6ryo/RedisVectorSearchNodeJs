import { createClient, SchemaFieldTypes, VectorAlgorithms } from "redis"
import { getEmbedding } from "./openai"
import dotenv from "dotenv"
import { randomUUID } from "crypto";
dotenv.config()

function float32Buffer(arr: number[]) {
  return Buffer.from(new Float32Array(arr).buffer)
}

;(async () => {

  const client = createClient({
    url: process.env.REDIS_URL
  })
  await client.connect();

  const indexName = randomUUID()
  try {
    await client.ft.create(indexName, {
      v: {
        type: SchemaFieldTypes.VECTOR,
        ALGORITHM: VectorAlgorithms.HNSW,
        TYPE: "FLOAT32",
        DIM: 1536,
        DISTANCE_METRIC: "COSINE"
      }
    }, {
      ON: "HASH",
      PREFIX: indexName
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Index already exists") {
      console.log("Index exists already, skipped creation.");
    } else {
      // Something went wrong, perhaps RediSearch isn"t installed...
      console.error(e);
      process.exit(1);
    }
  }

  const sentences = [
    "今日はいい天気ですね",
    "あの人はとても優しいです",
    "うさぎはとても可愛いです",
    "あのワインはとても美味しいです",
    "彼の叔父はとても有名な人です",
    "今日は雨模様ですね",
  ]
  const embeddings = await Promise.all(sentences.map(getEmbedding))

  await Promise.all(embeddings.map((embedding, i) => {
    return client.hSet(`${indexName}:${i}`, {
      sentence: sentences[i],
      v: float32Buffer(embedding)
    })
  }))

  const k = 4
  const sentenceToSearch = "今日は曇りですね"
  const emb = await getEmbedding(sentenceToSearch)
  const results = await client.ft.search(indexName, `*=>[KNN ${k} @v $BLOB AS distance]`, {
    PARAMS: {
      BLOB: float32Buffer(emb)
    },
    SORTBY: "distance",
    DIALECT: 2,
    RETURN: ["distance", "sentence"]
  })

  console.log("SEARCH QUERY: ", sentenceToSearch)
  results.documents.forEach((doc, rank) => {
    console.log("RANK:", rank)
    console.log("  Distance:", doc.value.distance)
    console.log("  Sentence:", doc.value.sentence)
  })
  await client.quit()
})()