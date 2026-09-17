import { NextRequest } from "next/server";
import { getExpenses, saveExpense } from "@/lib/expenses";
import {
  answerExpenseQuestion,
  classifyMessage,
  confirmationMessage,
  extractExpenseFromMessage,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { message?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return Response.json(
        { ok: false, reply: "메시지를 입력해 주세요.", expense: null },
        { status: 400 },
      );
    }

    if (classifyMessage(message) === "question") {
      const { expenses, error } = await getExpenses();
      if (error) {
        return Response.json({
          ok: false,
          reply: "지출 내역을 불러오지 못해서 지금은 답하기 어려워요.",
          expense: null,
        });
      }

      const reply = await answerExpenseQuestion(message, expenses);
      return Response.json({ ok: true, reply, expense: null });
    }

    const parsed = await extractExpenseFromMessage(message);

    if (!parsed.date || parsed.amount == null) {
      return Response.json({
        ok: true,
        reply: "날짜나 금액을 파악하지 못했어요. 예: 어제 택시 2만 원",
        expense: null,
        parsed,
      });
    }

    const description = parsed.description || "지출";
    const saved = await saveExpense({
      date: parsed.date,
      amount: parsed.amount,
      description,
    });

    if ("error" in saved) {
      return Response.json({
        ok: false,
        reply: saved.error,
        expense: null,
        parsed,
      });
    }

    return Response.json({
      ok: true,
      reply: confirmationMessage({
        date: parsed.date,
        amount: parsed.amount,
        description,
      }),
      expense: saved.expense,
      parsed: {
        date: parsed.date,
        amount: parsed.amount,
        description,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    console.error("chat api failed:", detail);

    const missingKey = detail.includes("Gemini API 키가 없습니다");
    return Response.json(
      {
        ok: false,
        reply: missingKey
          ? "Gemini API 키가 서버에 없어요. 로컬은 .env.local, 배포는 호스팅 설정의 GEMINI_API_KEY를 확인해 주세요."
          : "지금은 Gemini와 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.",
        expense: null,
      },
      { status: 500 },
    );
  }
}
