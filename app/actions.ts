"use server";

import { revalidatePath } from "next/cache";
import { saveExpense, type Expense } from "@/lib/expenses";

export async function createExpense(input: {
  date: string;
  amount: number;
  description: string;
}): Promise<{ ok: true; expense: Expense } | { ok: false; message: string }> {
  const result = await saveExpense(input);
  if ("error" in result) {
    return { ok: false, message: result.error };
  }

  revalidatePath("/");
  return { ok: true, expense: result.expense };
}
