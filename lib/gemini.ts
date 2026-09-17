import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Expense } from "@/lib/expenses";

export type ExtractedExpense = {
  date: string | null;
  amount: number | null;
  description: string | null;
};

function kstDate(offsetDays = 0) {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60_000;
  const kst = new Date(utc + 9 * 60 * 60_000);
  kst.setDate(kst.getDate() + offsetDays);
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, "0");
  const day = String(kst.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

function getGeminiModel(temperature: number, json: boolean) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini API 키가 없습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      temperature,
      ...(json ? { responseMimeType: "application/json" as const } : {}),
    },
  });
}

function mondayOfWeek(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function classifyMessage(message: string): "question" | "expense" {
  const hasAmount =
    /\d[\d,]*\s*만\s*원|\d[\d,]*\s*천\s*원|\d[\d,]*\s*원|\d+\s*만원|\d+\s*천원/.test(message);
  const hasQuestionWord =
    /얼마|뭐|어떻게|얼마나|어디|언제|왜|어떤|몇|더라|알려|총액|합계|가장 많이|제일 많이|많이 쓴|총 지출|\?/.test(
      message,
    );

  if (hasAmount) return "expense";
  if (hasQuestionWord) return "question";
  return "expense";
}

export async function extractExpenseFromMessage(message: string): Promise<ExtractedExpense> {
  const today = kstDate(0);
  const yesterday = kstDate(-1);
  const model = getGeminiModel(0.2, true);

  const result = await model.generateContent(`당신은 가계부 분석기입니다. 사용자 한국어 메시지에서 지출 정보만 추출하세요.

오늘 날짜: ${today}
어제 날짜: ${yesterday}

규칙:
- date는 YYYY-MM-DD. "오늘"은 ${today}, "어제"는 ${yesterday}.
- 날짜를 알 수 없으면 date는 null. 추측해서 오늘로 넣지 마세요.
- amount는 정수(원). "2만 원"은 20000, "1,500원"은 1500.
- 금액을 알 수 없으면 amount는 null.
- description은 짧은 내용. 예: 택시, 점심. 없으면 null.
- JSON만 반환: {"date": string|null, "amount": number|null, "description": string|null}

사용자: ${message}`);

  const parsed = JSON.parse(extractJson(result.response.text())) as Partial<ExtractedExpense>;
  const amount = parsed.amount == null ? null : Math.round(Number(parsed.amount));

  return {
    date: typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
    amount: Number.isFinite(amount) && amount != null && amount > 0 ? amount : null,
    description: parsed.description?.trim() || null,
  };
}

export async function answerExpenseQuestion(question: string, expenses: Expense[]): Promise<string> {
  const today = kstDate(0);
  const yesterday = kstDate(-1);
  const monthStart = `${today.slice(0, 7)}-01`;
  const thisMonday = mondayOfWeek(today);
  const lastMonday = addDays(thisMonday, -7);
  const lastSunday = addDays(thisMonday, -1);

  const rows =
    expenses.length === 0
      ? "(기록 없음)"
      : expenses
          .map((item) => {
            const weekday = new Date(`${item.date}T00:00:00`).toLocaleDateString("ko-KR", {
              weekday: "short",
            });
            return `${item.date} (${weekday}) | ${item.amount}원 | ${item.description}`;
          })
          .join("\n");

  const model = getGeminiModel(0.5, false);
  const result = await model.generateContent(`당신은 친근한 한국어 가계부 비서입니다.
아래 지출 기록만 보고 질문에 답하세요. 기록에 없는 내용은 지어내지 마세요.

기간:
- 오늘: ${today}
- 어제: ${yesterday}
- 이번 달: ${monthStart} ~ ${today}
- 이번 주(월~일): ${thisMonday} ~ ${addDays(thisMonday, 6)}
- 지난 주(월~일): ${lastMonday} ~ ${lastSunday}

답변 규칙:
- 한두 문장, 말하듯이 친근하게.
- 금액은 천 단위 쉼표(예: 15,000원).
- "이번 달 총 지출"은 이번 달 금액을 합산하세요.
- "가장 많이 쓴 항목"은 내용(description)별로 합산해 가장 큰 항목을 말하세요.
- "어제 뭐 샀더라"는 날짜가 ${yesterday}인 기록만 말하세요. 오늘(${today}) 기록은 넣지 마세요.
- "지난주"는 지난 주 월요일~일요일만 합산하세요.
- "식비"는 점심, 저녁, 아침, 커피, 간식, 밥, 음식처럼 먹는 관련 항목을 묶어 합산하세요.
- 해당 기간 기록이 없으면 솔직히 없다고 말하세요.

지출 기록(날짜 | 금액 | 내용):
${rows}

질문: ${question}`);

  const text = result.response.text().trim();
  return text || "기록을 살펴봤는데, 바로 답하기 어려워요. 조금 다르게 물어봐 주시겠어요?";
}

export function confirmationMessage(expense: {
  date: string;
  amount: number;
  description: string;
}) {
  const label = new Date(`${expense.date}T00:00:00`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  return `${label} ${expense.description} ${expense.amount.toLocaleString("ko-KR")}원을 저장했어요!`;
}
