import { getSupabase } from "@/lib/supabase";

export type Expense = {
  id: number;
  created_at: string;
  date: string;
  amount: number;
  description: string;
};

export async function getExpenses(): Promise<{ expenses: Expense[]; error: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, created_at, date, amount, description")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getExpenses failed:", error.message);
    return {
      expenses: [],
      error: "지출 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return { expenses: data ?? [], error: "" };
}

export async function saveExpense(input: {
  date: string;
  amount: number;
  description: string;
}): Promise<{ expense: Expense } | { error: string }> {
  const date = input.date.trim();
  const description = input.description.trim();
  const amount = Number(input.amount);

  if (!date || !description || !Number.isInteger(amount) || amount <= 0) {
    return { error: "날짜, 금액, 내용을 모두 올바르게 입력해 주세요." };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("expenses")
    .insert({ date, amount, description })
    .select("id, created_at, date, amount, description")
    .single();

  if (error || !data) {
    console.error("saveExpense failed:", error?.message);
    return { error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { expense: data };
}
