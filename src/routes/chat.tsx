import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus, MessageCircle, Trash2, Pizza } from "lucide-react";
import { loadThreads, newThreadId, saveThreads, type ChatThread } from "@/lib/chat-storage";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Easy Pizza" },
      { name: "description", content: "Chat with the Easy Pizza assistant to browse the menu and place an order." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [ready, setReady] = useState(false);

  // Idempotent bootstrap: read localStorage; if no threads, create one and persist; navigate to active.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = loadThreads();
    if (existing.length === 0) {
      const t: ChatThread = {
        id: newThreadId(),
        title: "New chat",
        updatedAt: Date.now(),
        messages: [],
      };
      saveThreads([t]);
      setThreads([t]);
      setReady(true);
      if (!activeId) navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
    } else {
      setThreads(existing);
      setReady(true);
      if (!activeId) {
        const sorted = [...existing].sort((a, b) => b.updatedAt - a.updatedAt);
        navigate({ to: "/chat/$threadId", params: { threadId: sorted[0].id }, replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync threads from storage when active changes (so child writes are reflected on switch)
  useEffect(() => {
    if (!ready) return;
    setThreads(loadThreads());
  }, [activeId, ready]);

  const createThread = useCallback(() => {
    const t: ChatThread = {
      id: newThreadId(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    const next = [t, ...loadThreads()];
    saveThreads(next);
    setThreads(next);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  }, [navigate]);

  const deleteThread = useCallback(
    (id: string) => {
      const current = loadThreads();
      const next = current.filter((t) => t.id !== id);
      if (next.length === 0) {
        const t: ChatThread = {
          id: newThreadId(),
          title: "New chat",
          updatedAt: Date.now(),
          messages: [],
        };
        next.push(t);
      }
      saveThreads(next);
      setThreads(next);
      if (id === activeId) {
        navigate({ to: "/chat/$threadId", params: { threadId: next[0].id }, replace: true });
      }
    },
    [activeId, navigate],
  );

  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <section className="mx-auto grid h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 gap-0 px-0 md:grid-cols-[260px_1fr] md:px-6 md:py-6">
      <aside className="hidden flex-col border-r border-border/60 bg-card/30 md:flex md:rounded-l-2xl md:border">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-4">
          <Pizza className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-display text-base text-foreground">Easy Pizza</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Assistant</p>
          </div>
        </div>
        <button
          onClick={createThread}
          className="mx-3 mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        <ul className="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {sortedThreads.map((t) => {
            const active = t.id === activeId;
            return (
              <li
                key={t.id}
                className={`group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.title || "New chat"}</span>
                </Link>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete chat"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex h-full min-h-0 flex-col border-border/60 md:rounded-r-2xl md:border md:border-l-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:hidden">
          <p className="font-display text-base text-foreground">Easy Pizza assistant</p>
          <button
            onClick={createThread}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>
        {ready && <Outlet />}
      </div>
    </section>
  );
}
