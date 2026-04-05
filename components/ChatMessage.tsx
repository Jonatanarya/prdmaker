export function ChatMessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-600/90 text-white"
            : "bg-zinc-800 text-zinc-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}