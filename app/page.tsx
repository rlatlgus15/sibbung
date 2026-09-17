import ChatPanel from "@/app/components/chat-panel";
import { getExpenses } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { expenses, error } = await getExpenses();

  return (
    <div className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f7f5] text-[#1d1d1f]">
      <header className="shrink-0 bg-white px-4 py-4 text-center sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">AI 가계부 챗봇</h1>
      </header>

      <ChatPanel initialExpenses={expenses} loadError={error} />
    </div>
  );
}
