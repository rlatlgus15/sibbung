"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export async function createExpense(input: {
  date: string;
  amount: number;
  description: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const date = input.date.trim();
  const description = input.description.trim();
  const amount = Number(input.amount);

  if (!date || !description || !Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: "날짜, 금액, 내용을 모두 올바르게 입력해 주세요." };
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("expenses").insert({
    date,
    amount,
    description,
  });

  if (error) {
    return { ok: false, message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/");
  return { ok: true };
}
