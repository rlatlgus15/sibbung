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
    return {
      expenses: [],
      error: "지출 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return { expenses: data ?? [], error: "" };
}
