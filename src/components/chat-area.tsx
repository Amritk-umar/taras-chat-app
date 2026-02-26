"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Trash2, Send, Loader2, Check, CheckCheck, AlertCircle } from "lucide-react";
import { ChatSkeleton } from "./ui/skeleton-loader";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [content, setContent] = useState("");
  const [isError, setIsError] = useState(false); // Error state tracking
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const messages = useQuery(api.messages.list, { conversationId });
  const conversation = useQuery(api.conversations.getById, { conversationId });
  const typingUser = useQuery(api.conversations.getTypingStatus, { conversationId });
  const currentUser = useQuery(api.users.currentUser);

  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.conversations.setTypingIndicator);
  const deleteMessage = useMutation(api.messages.remove);
  const markAsRead = useMutation(api.messages.markAsRead);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  // 1. Auto-scroll to bottom
  useEffect(() => {
    if (messages) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 2. Mark as read logic
  useEffect(() => {
    if (conversationId && messages && messages.length > 0) {
      markAsRead({ conversationId });
    }
  }, [conversationId, messages, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    setTyping({ conversationId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping({ conversationId, isTyping: false });
    }, 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsError(false); // Reset error state on attempt
      await sendMessage({ conversationId, content });
      setContent("");
      setTyping({ conversationId, isTyping: false });
    } catch (error) {
      console.error("Failed to send:", error);
      setIsError(true); // Trigger error banner
    }
  };

  if (messages === undefined || conversation === undefined) {
    return <ChatSkeleton />;
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-950">
        Conversation not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Avatar logic for Group vs Individual */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
            {conversation.isGroup ? (
              <span className="text-blue-600 font-bold text-xs">GRP</span>
            ) : (
              <img
                src={conversation.otherUser?.imageUrl}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            )}
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {/* Requirement 14: Show Group Name or User Name */}
              {conversation.isGroup ? conversation.name : conversation.otherUser?.name}
            </h2>
            <div className="h-4">
              {typingUser ? (
                <span className="text-xs text-blue-500 animate-pulse font-medium">
                  {conversation.isGroup ? `${typingUser} is typing...` : "typing..."}
                </span>
              ) : (
                <p className="text-xs text-green-500 font-medium">
                  {conversation.isGroup
                    ? `${conversation.memberCount} members`
                    : conversation.otherUser?.isOnline ? "Online" : "Away"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-slate-900/10 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?._id;

          return (
            <div key={msg._id} className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className="relative">
                {/* Emoji Picker */}
                {!msg.isDeleted && (
                  <div className={`absolute -top-10 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl p-1 z-20 gap-1 animate-in fade-in zoom-in duration-200`}>
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                        className="hover:scale-125 transition-transform px-1.5 text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`
                  max-w-[280px] sm:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none"}
                  ${msg.isDeleted ? "opacity-60 italic" : ""}
                `}>
                  {msg.isDeleted ? (
                    <p className="text-xs">This message was deleted</p>
                  ) : (
                    <>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex justify-end items-center mt-1 gap-1.5 ${isMe ? "text-blue-100" : "text-slate-400"}`}>
                        <span className="text-[10px]">
                          {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <div className="flex items-center">
                            {msg.isRead ? <CheckCheck className="w-3 h-3 text-sky-300" /> : <Check className="w-3 h-3 text-blue-200" />}
                          </div>
                        )}
                        {isMe && (
                          <button
                            onClick={() => deleteMessage({ messageId: msg._id })}
                            className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                    {msg.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => toggleReaction({ messageId: msg._id, emoji: r.emoji })}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border transition-all ${currentUser && r.userIds.includes(currentUser._id)
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="font-medium">{r.userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="px-4 py-2 text-xs bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 flex justify-between items-center animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            <span>Message failed to send.</span>
          </div>
          <button
            onClick={() => handleSend()}
            className="underline font-bold hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            value={content}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}