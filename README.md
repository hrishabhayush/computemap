# AI Atlas

A React + TypeScript + React Three Fiber playground for the physical infrastructure behind AI. Tailwind CSS and shared styles provide a consistent interface across three procedural 3D environments, all visible together in one connected world. Selecting objects changes the inspector without unmounting other environments. Show all restores the overview; Focus selected environment moves the camera closer.

## Run

npm install
npm run dev

## Validate

npm run check
npm run build

## Structure

- src/graph.ts: physical components, typed dependency relationships, guided journey.
- src/Scene.tsx: procedural laptop, data center and exploded GPU server, orbit controls and smooth camera movement.
- src/App.tsx: navigation, inspector, pause/resume, simulated request and response.
- src/style.css: shared visual system and responsive layouts.

The prompt journey is educational and simulated. No prompts are sent to an AI service. The equipment is schematic, not to scale, not a model of a particular provider's facility, and does not provide measured latency or energy use. Manufacturing and materials are dependency previews rather than full 3D environments.

Conceptual reference: user-provided Economics.pdf, especially the device-to-inference sketch, electricity-to-heat stack and server components. Unverified numerical claims from those notes are not used. Hardware reference: https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html
