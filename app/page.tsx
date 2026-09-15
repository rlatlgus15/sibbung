import ExpenseForm from "@/app/components/expense-form";
import ExpenseList from "@/app/components/expense-list";
import { getExpenses } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { expenses, error } = await getExpenses();

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[#f7f7f5] pb-[env(safe-area-inset-bottom)] text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-xl min-w-0 flex-1 flex-col px-6 py-12 sm:px-8 sm:py-20">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-4xl">
            시현 AI 스마트 가계부
          </h1>
          <p className="mt-3 max-w-sm text-lg leading-7 text-[#86868b] sm:mt-4 sm:text-base sm:leading-7">
            날짜, 금액, 내용을 기록하세요.
          </p>
        </header>

        <div className="flex flex-col gap-14 sm:gap-16">
          <ExpenseForm />
          <ExpenseList expenses={expenses} error={error} />
        </div>
      </main>
    </div>
  );
}
