import type { Expense } from "@/lib/expenses";

function formatAmount(value: number) {
  return value.toLocaleString("ko-KR");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function ExpenseList({
  expenses,
  error,
}: {
  expenses: Expense[];
  error: string;
}) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="w-full min-w-0">
      <div className="mb-6 flex items-end justify-between gap-6 sm:mb-7">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight sm:text-lg">지출 내역</h2>
          <p className="mt-1.5 text-base text-[#86868b] sm:text-sm">
            {error ? error : expenses.length === 0 ? "아직 기록이 없습니다." : `${expenses.length}건`}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-sm text-[#86868b] sm:text-xs">합계</span>
          <span className="font-numeric mt-1 block text-3xl font-medium leading-none sm:text-2xl">
            {formatAmount(total)}
            <span className="ml-1 font-sans text-base font-normal text-[#86868b] sm:text-sm">원</span>
          </span>
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {expenses.map((expense) => (
          <li key={expense.id} className="rounded-2xl bg-[#efefed] px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 pt-0.5">
                <p className="break-words text-lg font-medium tracking-tight sm:text-base">
                  {expense.description}
                </p>
                <p className="mt-1 text-base text-[#86868b] sm:text-sm">{formatDate(expense.date)}</p>
              </div>
              <p className="font-numeric shrink-0 text-2xl font-medium leading-none sm:text-xl">
                -{formatAmount(expense.amount)}
                <span className="ml-0.5 font-sans text-sm font-normal text-[#86868b]">원</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
