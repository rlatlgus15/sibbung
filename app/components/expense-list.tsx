import type { Expense } from "@/lib/expenses";

function formatAmount(value: number) {
  return value.toLocaleString("ko-KR");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", {
    month: "short",
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
  const total = (expenses ?? []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="shrink-0 bg-white px-4 py-3 sm:px-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">지출 내역</h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            {error ? error : (expenses ?? []).length === 0 ? "아직 기록이 없습니다." : `${expenses.length}건`}
          </p>
        </div>
        <p className="font-numeric text-xl font-medium leading-none">
          {formatAmount(total)}
          <span className="ml-0.5 font-sans text-sm font-normal text-[#86868b]">원</span>
        </p>
      </div>

      <ul className="flex max-h-36 flex-col gap-2 overflow-y-auto sm:max-h-44">
        {(expenses ?? []).map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f7f5] px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{expense.description}</p>
              <p className="mt-0.5 text-xs text-[#86868b]">{formatDate(expense.date)}</p>
            </div>
            <p className="font-numeric shrink-0 text-base font-medium">
              -{formatAmount(expense.amount)}
              <span className="ml-0.5 font-sans text-xs font-normal text-[#86868b]">원</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
