import AccountBook from "@/app/components/account-book";
import { getExpenses } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { expenses, error } = await getExpenses();

  return <AccountBook initialExpenses={expenses} loadError={error} />;
}
