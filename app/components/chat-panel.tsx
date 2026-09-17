"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Expense } from "@/lib/expenses";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function ChatPanel({
  onExpenseSaved,
}: {
  onExpenseSaved?: (expense: Expense) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        expense?: Expense | null;
      };

      if (result.expense) {
        onExpenseSaved?.(result.expense);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: result.reply || "지금은 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: "지금은 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex min-h-0 shrink-0 flex-col border-t border-black/5 bg-white">
      {messages.length > 0 || sending ? (
        <div className="max-h-28 overflow-y-auto px-4 py-2 sm:max-h-40 sm:px-6 sm:py-3">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={
                    message.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-[#1d1d1f] px-3 py-2 text-sm leading-5 text-white"
                      : "max-w-[80%] rounded-2xl rounded-bl-md bg-[#efefed] px-3 py-2 text-sm leading-5 text-[#1d1d1f]"
                  }
                >
                  {message.text}
                </p>
              </div>
            ))}

            {sending ? (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md bg-[#efefed] px-3 py-2 text-sm tracking-[0.3em] text-[#86868b]">
                  ···
                </p>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-xl items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="AI에게 말하기 · 예: 오늘 커피 3000원"
            disabled={sending}
            className="h-14 min-w-0 flex-1 rounded-2xl bg-[#f7f7f5] px-4 text-base text-[#1d1d1f] outline-none placeholder:text-[#c7c7cc] focus:ring-2 focus:ring-[#1d1d1f]/10 disabled:opacity-60 sm:h-12 sm:text-sm"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-14 shrink-0 rounded-2xl bg-[#1d1d1f] px-5 text-base font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:text-sm"
          >
            전송
          </button>
        </div>
      </form>
    </section>
  );
}
