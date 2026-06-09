import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
// keep useRef for persistedRef
import { toast } from "sonner";
import { Pizza, Wrench } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { deriveTitle, loadThreads, saveThreads, type ChatThread } from "@/lib/chat-storage";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

const SUGGESTIONS = [
  "What's on the menu?",
  "I want a vegetarian pizza",
  "How long is delivery?",
  "Help me place an order",
];

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  // Load this thread's messages from localStorage once per threadId.
  useEffect(() => {
    const threads = loadThreads();
    const t = threads.find((x) => x.id === threadId);
    setInitialMessages(t?.messages ?? []);
  }, [threadId]);

  if (initialMessages === null) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return <ChatWindow key={threadId} threadId={threadId} initialMessages={initialMessages} />;
}

function ChatWindow({ threadId, initialMessages }: { threadId: string; initialMessages: UIMessage[] }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Chat error");
    },
  });

  // Persist messages per thread whenever they change.
  const persistedRef = useRef<string>("");
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    const serialized = JSON.stringify(messages);
    if (serialized === persistedRef.current) return;
    persistedRef.current = serialized;
    const all = loadThreads();
    const idx = all.findIndex((t) => t.id === threadId);
    const updated: ChatThread = {
      id: threadId,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
      messages,
    };
    if (idx === -1) all.unshift(updated);
    else all[idx] = updated;
    saveThreads(all);
  }, [messages, status, threadId]);

  useEffect(() => {
    const el = document.querySelector<HTMLTextAreaElement>('textarea[data-slot="input-group-control"], textarea');
    el?.focus();
  }, [threadId, status]);

  const handleSubmit = (msg: PromptInputMessage) => {
    const text = (msg.text ?? "").trim();
    if (!text) return;
    void sendMessage({ text });
  };

  const handleSuggestion = (text: string) => {
    void sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Pizza className="h-8 w-8 text-primary" />}
              title="Ciao! I'm the Easy Pizza assistant."
              description="Ask about the menu, hours, or just say 'I want to order' and I'll guide you."
            >
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      if (m.role === "assistant") {
                        return <MessageResponse key={i}>{part.text}</MessageResponse>;
                      }
                      return (
                        <p key={i} className="whitespace-pre-wrap text-sm">
                          {part.text}
                        </p>
                      );
                    }
                    if (part.type?.startsWith("tool-") || part.type === "dynamic-tool") {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const tp = part as any;
                      return (
                        <Tool key={i} defaultOpen={false}>
                          <ToolHeader type={tp.type} state={tp.state} />
                          <ToolContent>
                            <ToolInput input={tp.input} />
                            <ToolOutput
                              output={
                                tp.output ? (
                                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                                    {JSON.stringify(tp.output, null, 2)}
                                  </pre>
                                ) : undefined
                              }
                              errorText={tp.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5" />
                  <Shimmer>Thinking…</Shimmer>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 bg-background/70 p-3 backdrop-blur">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea placeholder="Ask about the menu or place an order…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isLoading && status !== "streaming"} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
