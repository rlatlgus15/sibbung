"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ExpenseList from "@/app/components/expense-list";
import type { Expense } from "@/lib/expenses";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

const WELCOME =
  "지출을 말해 주시거나, 이번 달 얼마 썼는지 물어봐 주세요.";

export default function ChatPanel({
  initialExpenses,
  loadError,
}: {
  initialExpenses: Expense[];
  loadError: string;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "ai", text: WELCOME },
  ]);
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
        setExpenses((current) => [result.expense!, ...current]);
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
    <div className="flex min-h-0 flex-1 flex-col">
      <ExpenseList expenses={expenses} error={loadError} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <p
                className={
                  message.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-md bg-[#1d1d1f] px-4 py-3 text-base leading-6 text-white sm:text-sm"
                    : "max-w-[80%] rounded-2xl rounded-bl-md bg-[#efefed] px-4 py-3 text-base leading-6 text-[#1d1d1f] sm:text-sm"
                }
              >
                {message.text}
              </p>
            </div>
          ))}

          {sending ? (
            <div className="flex justify-start">
              <p className="rounded-2xl rounded-bl-md bg-[#efefed] px-4 py-3 text-sm tracking-[0.3em] text-[#86868b]">
                ···
              </p>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-xl items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="메시지를 입력하세요"
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
    </div>
  );
}
