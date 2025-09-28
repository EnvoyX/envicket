import { getCurrentUser } from "@/lib/current-user";
import NewTicketForm from "./NewTicketForm";
import { redirect } from "next/navigation";

async function NewTicketPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <NewTicketForm />
    </div>
  );
}

export default NewTicketPage;
