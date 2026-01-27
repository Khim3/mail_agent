"use client";

import { useState } from "react";

type MessageRef = {
  id: string;
  threadId: string;
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [messages, setMessages] = useState<MessageRef[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setSelectedEmail(null);

    const res = await fetch(
      `/api/test/gmail/search?q=${encodeURIComponent(keyword)}`
    );

    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  async function handleRead(id: string) {
    setReading(true);

    const res = await fetch(
      `/api/test/gmail/read?id=${id}`
    );

    const data = await res.json();
    setSelectedEmail(data);
    setReading(false);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6">

        {/* LEFT: Search */}
        <div className="space-y-4">

          <h1 className="text-3xl font-bold">
            📬 Gmail Agent Console
          </h1>

          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="invoice OR aws OR receipt"
              className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 outline-none"
            />

            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-blue-600 rounded hover:bg-blue-500"
            >
              Search
            </button>
          </div>

          {loading && (
            <p className="text-blue-400">Searching...</p>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => handleRead(m.id)}
                className="p-3 rounded bg-gray-800 cursor-pointer hover:bg-gray-700"
              >
                <p className="text-sm text-gray-300">
                  ID: {m.id}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT: Email Viewer */}
        <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto">

          {!selectedEmail && !reading && (
            <p className="text-gray-400">
              Select an email to view content
            </p>
          )}

          {reading && (
            <p className="text-blue-400">
              Loading email...
            </p>
          )}

          {selectedEmail && (
            <div className="space-y-4">

              <div>
                <h2 className="text-xl font-semibold">
                  {selectedEmail.subject}
                </h2>
                <p className="text-sm text-gray-400">
                  From: {selectedEmail.from}
                </p>
                <p className="text-sm text-gray-400">
                  To: {selectedEmail.to}
                </p>
              </div>

              <pre className="whitespace-pre-wrap text-sm">
                {selectedEmail.body}
              </pre>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
