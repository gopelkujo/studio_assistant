import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatArea } from "@/components/chat-area";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-zinc-950">
      <ChatSidebar />
      <ChatArea />
    </main>
  );
}
