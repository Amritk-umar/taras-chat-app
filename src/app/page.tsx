"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { Id } from "../../convex/_generated/dataModel";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { ChevronLeft, MessageSquare } from "lucide-react";

export default function Home() {
  const [activeChat, setActiveChat] = useState<Id<"conversations"> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | undefined>(undefined);

  /**
   * Handles selecting a conversation.
   * On mobile, this hides the sidebar and shows the ChatArea.
   */
  const handleSelectChat = (conversationId: Id<"conversations">, userId?: Id<"users">) => {
    setActiveChat(conversationId);
    if (userId) setSelectedUserId(userId);
  };

  /**
   * Navigates back to the chat list on mobile.
   */
  const handleBack = () => {
    setActiveChat(null);
  };

  return (
    <main className="h-screen w-full bg-white dark:bg-slate-950 overflow-hidden transition-colors">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="flex h-full w-full">
          
          {/* --- VIEW 1: CHAT LIST (SIDEBAR) --- */}
          {/* Hidden on mobile if a chat is active. Always visible on md+ screens. */}
          <div className={`
            ${activeChat ? "hidden" : "flex"} 
            md:flex md:w-80 lg:w-96 flex-col border-r border-slate-200 dark:border-slate-800 h-full w-full
          `}>
            <Sidebar 
              onSelectChat={handleSelectChat} 
              selectedUserId={selectedUserId}
            />
          </div>

          {/* --- VIEW 2: CONVERSATION (CHAT AREA) --- */}
          {/* Visible on mobile only if a chat is active. Always visible on md+ screens. */}
          <div className={`
            ${activeChat ? "flex" : "hidden"} 
            md:flex flex-1 flex-col h-full bg-slate-50 dark:bg-slate-900/50
          `}>
            {activeChat ? (
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* Mobile-only Header (WhatsApp Style Navigation) */}
                <div className="md:hidden flex items-center px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <button 
                    onClick={handleBack}
                    className="p-1 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-blue-600 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                  <div className="font-bold text-slate-800 dark:text-slate-100">Conversation</div>
                </div>

                {/* Main Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <ChatArea conversationId={activeChat} />
                </div>
              </div>
            ) : (
              /* Desktop Landing View (Empty State) */
              <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-950 transition-colors">
                <div className="flex flex-col items-center max-w-sm">
                  <div className="p-4 rounded-full bg-blue-50 dark:bg-slate-900 mb-6">
                    <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Tars Chat
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Select a contact from the list to start messaging. 
                    Your messages are synced in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </SignedIn>
    </main>
  );
}