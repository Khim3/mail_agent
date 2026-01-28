"use client";

import { useState } from "react";

type Step = {
  tool: string;
  input?: any;
  output?: any;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);

  async function runAgent() {
    setLoading(true);
    setAnswer(null);
    setSteps([]);

    const res = await fetch(
      `/api/agent/mail?q=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    setAnswer(data.answer);
    setSteps(data.steps || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-3xl font-bold">
          📬 Agentic Mail Demo
        </h1>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="get me 2 invoice mails from steam last month and extract spending and send to me"
            className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 outline-none"
          />

          <button
            onClick={runAgent}
            className="px-5 py-3 bg-blue-600 rounded hover:bg-blue-500"
          >
            Run Agent
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-blue-400">
            Agent is thinking...
          </p>
        )}

        {/* Answer */}
        {answer && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-semibold mb-2">
              ✅ Final Answer
            </h2>
            <pre className="whitespace-pre-wrap">
              {answer}
            </pre>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="bg-gray-800 p-4 rounded space-y-3">

            <h2 className="font-semibold">
              🔁 Tool Call Stages
            </h2>

            {steps.map((s, i) => (
              <div
                key={i}
                className="bg-gray-900 p-3 rounded"
              >
                <p className="text-blue-400">
                  Step {i + 1}: {s.tool}
                </p>

                {s.input && (
                  <pre className="text-sm mt-1">
                    Input: {JSON.stringify(s.input, null, 2)}
                  </pre>
                )}

                {s.output && (
                  <pre className="text-sm mt-1">
                    Output: {JSON.stringify(s.output, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
