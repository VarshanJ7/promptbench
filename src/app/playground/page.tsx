import { MODELS } from "@/lib/providers/pricing";
import PlaygroundForm from "./PlaygroundForm";

export default function PlaygroundPage() {
  const models = Object.entries(MODELS).map(([id, info]) => ({
    id,
    label: info.label,
  }));

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Playground</h1>
      <p className="mt-2 text-gray-400">
        Send one prompt to one model to check the provider layer.
      </p>
      <PlaygroundForm models={models} />
    </main>
  );
}
