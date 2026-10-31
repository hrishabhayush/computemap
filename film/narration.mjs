// Generates every narration clip + word timings. Run: node --env-file=.env.local --experimental-strip-types film/narration.mjs
// Skips clips that already exist, so editing one line only re-generates that line (delete its .mp3 first).
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { scenes } from "./script.ts";

const client = new ElevenLabsClient();
const dir = new URL("./public/narration/", import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const lines = scenes.flatMap((s) => s.lines.map((text, i) => ({ name: `${s.id}-${i}`, text })));

for (const [i, { name, text }] of lines.entries()) {
  const mp3 = `${dir}${name}.mp3`;
  if (!existsSync(mp3)) {
    const audio = await client.textToSpeech.convert("lxYfHSkYm1EzQzGhdbfc", { // Jessica Anne Bogart, VO professional
      text, modelId: "eleven_v4",
      previousText: lines[i - 1]?.text, nextText: lines[i + 1]?.text, // keeps tone continuous across clips
    });
    await finished(Readable.fromWeb(audio).pipe(createWriteStream(mp3)));
  }
  const json = `${dir}${name}.json`;
  if (!existsSync(json)) {
    const r = await client.speechToText.convert({ file: createReadStream(mp3), modelId: "scribe_v2", timestampsGranularity: "word" });
    const words = r.words.filter((w) => w.type === "word").map((w) => ({ t: +w.start.toFixed(2), end: +w.end.toFixed(2), w: w.text }));
    writeFileSync(json, JSON.stringify({ duration: words.at(-1).end, words }));
  }
  console.log("ok", name);
}

// One combined index the film imports: { "s01-0": {duration, words:[{t,end,w}]}, ... }
import { readFileSync } from "fs";
writeFileSync(`${dir}index.json`, JSON.stringify(Object.fromEntries(lines.map(({ name }) => [name, JSON.parse(readFileSync(`${dir}${name}.json`, "utf8"))]))));
console.log("wrote index.json");
