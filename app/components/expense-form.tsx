"use client";

import { FormEvent, useState } from "react";
import { createExpense } from "@/app/actions";
import type { Expense } from "@/lib/expenses";

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

const fieldClassName =
  "h-14 w-full min-w-0 rounded-xl bg-white px-4 text-[#1d1d1f] outline-none transition placeholder:text-[#c7c7cc] focus:bg-white focus:ring-2 focus:ring-[#1d1d1f]/10 sm:h-12";

export default function ExpenseForm({
  onSaved,
}: {
  onSaved?: (expense: Expense) => void;
}) {
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!date || !description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setSaving(true);
    setError("");

    const result = await createExpense({
      date,
      amount: parsedAmount,
      description: description.trim(),
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSaved?.(result.expense);
    setAmount("");
    setDescription("");
    setDate(today());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="mb-6 text-base font-medium text-[#86868b] sm:mb-5 sm:text-sm">새 기록</p>

      <div className="space-y-7 rounded-2xl bg-[#efefed] p-5 sm:space-y-6 sm:p-7">
        <label className="block">
          <span className="mb-2 block text-base text-[#86868b] sm:mb-1.5 sm:text-sm">날짜</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className={`${fieldClassName} text-lg sm:text-base`}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-base text-[#86868b] sm:mb-1.5 sm:text-sm">금액</span>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              className={`${fieldClassName} font-numeric pr-12 text-2xl sm:text-xl`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base text-[#86868b] sm:text-sm">
              원
            </span>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-base text-[#86868b] sm:mb-1.5 sm:text-sm">내용</span>
          <input
            type="text"
            placeholder="점심, 교통비"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            className={`${fieldClassName} text-lg sm:text-base`}
          />
        </label>
      </div>

      {error ? <p className="mt-5 text-base text-[#86868b] sm:text-sm">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 h-16 w-full rounded-xl bg-[#1d1d1f] text-lg font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:h-12 sm:text-sm"
      >
        {saving ? "저장 중..." : saved ? "저장되었습니다" : "저장하기"}
      </button>
    </form>
  );
}
