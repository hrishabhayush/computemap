// Generates Scene 1 audio with ElevenLabs. Run: node --env-file=.env.local film/scene1/audio.mjs
// The SDK reads ELEVENLABS_API_KEY from the environment; the key never lives in code.
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

const client = new ElevenLabsClient();
const out = new URL("../public/scene1/", import.meta.url).pathname;
const save = async (audio, name) => {
  const stream = typeof audio.pipe === "function" ? audio : Readable.fromWeb(audio);
  await finished(stream.pipe(createWriteStream(out + name)));
  console.log("wrote", name);
};

const narration = "Every AI answer starts somewhere ordinary. A laptop. A question. You type it, press enter… and it begins a journey through the physical world.";

await save(await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", { text: narration, modelId: "eleven_v4" }), "narration.mp3"); // George, narrative
await save(await client.textToSoundEffects.convert({ text: "Soft laptop keyboard typing a short sentence, close mic, quiet room, natural human rhythm", durationSeconds: 5, promptInfluence: 0.6 }), "typing.mp3");
await save(await client.textToSoundEffects.convert({ text: "Soft modern UI message send whoosh, subtle and airy", durationSeconds: 1, promptInfluence: 0.7 }), "send.mp3");
