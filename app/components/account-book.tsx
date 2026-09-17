"use client";

import { useState } from "react";
import ChatPanel from "@/app/components/chat-panel";
import ExpenseForm from "@/app/components/expense-form";
import ExpenseList from "@/app/components/expense-list";
import type { Expense } from "@/lib/expenses";

export default function AccountBook({
  initialExpenses,
  loadError,
}: {
  initialExpenses: Expense[];
  loadError: string;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);

  function addExpense(expense: Expense) {
    setExpenses((current) => [expense, ...current.filter((item) => item.id !== expense.id)]);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f7f5] text-[#1d1d1f]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <main className="mx-auto flex w-full max-w-xl min-w-0 flex-col px-6 py-8 sm:px-8 sm:py-16">
          <header className="mb-8 sm:mb-12">
            <h1 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-4xl">
              시뿡 스마트 가계부
            </h1>
            <p className="mt-3 max-w-sm text-lg leading-7 text-[#86868b] sm:mt-4 sm:text-base sm:leading-7">
              날짜, 금액, 내용을 기록하세요.
            </p>
          </header>

          <div className="flex flex-col gap-14 pb-8 sm:gap-16">
            <ExpenseForm onSaved={addExpense} />
            <ExpenseList expenses={expenses} error={loadError} />
          </div>
        </main>
      </div>

      <ChatPanel onExpenseSaved={addExpense} />
    </div>
  );
}
