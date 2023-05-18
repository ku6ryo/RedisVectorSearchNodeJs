Redis vector search for OpenAI embeddings in Node.js.

Vector similarity search on Redis
https://redis.io/docs/stack/search/reference/vectors/

K-Nearest neighbors (KNN) query examples
https://redis.io/docs/stack/search/reference/vectors/#pure-knn-queries

Example code from the official `node-redis` repository.
https://github.com/redis/node-redis/blob/master/examples/search-hashes.js

# How to run
- Make a copy of sample.env as .env
- Set your OpenAI API key to .env
- Start redis server with `docker-compose up`
- `yarn` to install modules
- `yarn start` to run the program

# Results
```
SEARCH QUERY:  今日は曇りですね
RANK: 0
  Distance: 0.0672968029976
  Sentence: 今日は雨模様ですね
RANK: 1
  Distance: 0.0708317160606
  Sentence: 今日はいい天気ですね
RANK: 2
  Distance: 0.184568881989
  Sentence: あのワインはとても美味しいです
RANK: 3
  Distance: 0.186705172062
  Sentence: あの人はとても優しいです
```