# AI Atlas — the film script (draft 1, ~4:40)

One prompt, followed from your laptop through the physical world and back.
Narration pace ≈ 150 words/min. Each scene is built, previewed and rendered on its own, then joined.
Timings are targets; the recorded narration decides the final cut.

---

## 1. The prompt — 0:00–0:11 *(built: film/Scene1.tsx)*
**Picture:** Wide on the whole clay world → glide into the laptop. A chat screen; "Why is the sky blue?" is typed; Enter. The message pops into a bubble, thinking dots, a green packet lifts off toward the router.
**Sound:** Key clicks, soft send whoosh.
**Narration:**
> Every AI answer starts somewhere ordinary. A laptop. A question. You type it, press enter… and it begins a journey through the physical world.

## 2. Radio — 0:11–0:27
**Picture:** Packet reaches the router; Wi‑Fi rings pulse outward. Cut to the router's back: the packet drops down the amber Ethernet cable toward the optical terminal.
**Sound:** Soft radio shimmer as the rings pulse.
**Narration:**
> The first few metres are invisible. Your laptop turns the question into radio waves, scrambled so only your router can read them. The router catches them, and passes them down a cable to the street.

## 3. Light in glass — 0:27–0:52
**Picture:** Optical terminal (ONT) lights up; the packet becomes a streak of light racing along the fiber spool into the provider's building. Camera pulls back to show the distance between stations.
**Sound:** Rising whoosh, light "zip" through the fiber.
**Narration:**
> At the optical terminal, electricity becomes light. Pulses of laser light, flickering billions of times a second, travel through a strand of glass thinner than a hair — at about two‑thirds the speed of light. Your provider's routers pass them on, network to network, across cities, in a few hundredths of a second.

## 4. Arrival — 0:52–1:15
**Picture:** Wide reveal of the whole world, then push into the data center. The packet enters the network switch; optical transceivers blink; it is routed toward one rack.
**Sound:** Low hum of the hall fades in.
**Narration:**
> Then it arrives somewhere most people never see. A data center: a building full of computers, wired together, powered and cooled around the clock. A network switch turns the light back into electricity and steers your request to the machines running the model.

## 5. Into the rack — 1:15–1:38
**Picture:** Push into a server rack; its trays slide out (top‑of‑rack switch, NVLink switch tray, power shelf, coolant manifold), then into the GPU server: eight GPUs, CPU, memory, network card.
**Sound:** Fans; mechanical slide as trays open.
**Narration:**
> Inside a rack, trays of servers are stacked floor to ceiling. One AI rack can draw as much power as a hundred homes. In each server, eight GPUs do the heavy work, while a regular CPU, memory and network card keep everything fed.

## 6. Software takes over — 1:38–1:58
**Picture:** The software stack floats above the server; layers light up top to bottom — AI model, inference server, CUDA, Kubernetes, Linux — then the prompt splits into small token tiles.
**Sound:** Soft UI ticks per layer.
**Narration:**
> Software takes over. An inference server cuts your question into tokens — little pieces of words — and batches them with thousands of other people's questions, so the GPUs never sit idle.

## 7. The GPU thinks — 1:58–2:30
**Picture:** Zoom into one GPU; the heatsink lifts away to reveal the compute die and the HBM stacks beside it. Data flows die ↔ HBM; tokens are produced one at a time.
**Sound:** A rhythmic pulse, one beat per token.
**Narration:**
> On the GPU, the model reads your whole question at once. Then it writes the answer one token at a time. For every single token, billions of model weights stream in from the memory stacked right next to the chip — terabytes every second. That memory, called HBM, is one of the hardest parts of AI hardware to build.

## 8. Power — 2:30–3:10
**Picture:** Follow the amber line backwards: power shelf → the data center's electrical yard (switchgear, UPS batteries, backup generators) → substation and transmission lines → power plants: nuclear, gas, solar, wind.
**Sound:** Electrical hum building to the grid; turbines turning.
**Narration:**
> None of this runs without electricity — and a lot of it. Power enters the rack through a power shelf, which takes it from the building's own electrical system: switchgear, battery rooms in case the grid flickers, and diesel generators for when it fails. Beyond the fence, transmission lines bring it from power plants — nuclear, gas, wind and sun. Data centers already use around one and a half percent of the world's electricity, and AI is pushing that higher.

## 9. Heat — 3:10–3:35
**Picture:** Follow the blue line: cold plate on the GPU → coolant manifold → coolant distribution unit (CDU) → the cooling plant's fans spin and release heat outside.
**Sound:** Flowing liquid; fans spinning up.
**Narration:**
> Almost every watt becomes heat. So liquid flows through cold plates pressed onto every chip, carries the heat to a coolant distribution unit, and on to cooling towers and chillers outside, where it is released into the air.

## 10. Where chips come from — 3:35–3:55
**Picture:** Cut to the wafer station: a patterned silicon wafer, dies glinting in the clay pastels; one die lifts out and drops into the GPU package.
**Sound:** A crystalline shimmer.
**Narration:**
> And the chips themselves start as silicon wafers, patterned in fabs over months and hundreds of steps — some of the most precise manufacturing humans have ever done.

## 11. The answer returns — 3:55–4:22
**Picture:** Tokens stream back along the green path: switch → fiber → ONT → router → laptop. On screen, the answer types itself out under the question.
**Sound:** Reverse whoosh; soft typing of the answer.
**Narration:**
> Token by token, the answer makes the same journey back — through the switch, along the glass, over the radio — and appears on your screen. "Sunlight scatters off the air, and blue light scatters the most."

## 12. Closing — 4:22–4:40
**Picture:** Final slow pull back to the entire world, every path glowing at once. Title: **AI Atlas — the physical stack**.
**Sound:** Music resolves.
**Narration:**
> It took about a second. A question, carried by radio, light, electricity and water, through some of the largest machines ever built. That's what's behind every answer.
