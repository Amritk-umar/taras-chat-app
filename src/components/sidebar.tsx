"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { Search, Moon, Sun, Users, X, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarSkeleton } from "./ui/skeleton-loader";

interface SidebarProps {
  onSelectChat: (id: Id<"conversations">, userId?: Id<"users">) => void;
  selectedUserId?: Id<"users">;
}

function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-600" />
      <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
    </button>
  );
}

export function Sidebar({ onSelectChat, selectedUserId }: SidebarProps) {
  const { user: clerkUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");

  const users = useQuery(api.users.get);
  const startChat = useMutation(api.conversations.createOrGet);
  const createGroup = useMutation(api.conversations.createGroup);

  const filteredUsers = users?.filter((u) => {
    const isNotMe = u.clerkId !== clerkUser?.id;
    return isNotMe && u.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2 || !groupName) return;
    try {
      const id = await createGroup({ userIds: selectedUsers, groupName });
      onSelectChat(id); // Select the new group
      setIsGroupMode(false);
      setSelectedUsers([]);
      setGroupName("");
    } catch (error) {
      console.error("Group creation failed:", error);
    }
  };

  if (users === undefined) return <SidebarSkeleton />;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-full transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 sticky top-0 z-10">
        <span className="font-bold text-blue-600 dark:text-blue-500 text-xl tracking-tight">Tars Chat</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
                setIsGroupMode(!isGroupMode);
                setSelectedUsers([]); // Clear selections on toggle
            }}
            className={`p-2 rounded-md transition-colors ${isGroupMode ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            {isGroupMode ? <X className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </button>
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {isGroupMode ? (
        /* Group Creation UI */
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
          <input 
            placeholder="Group Name" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          />
          <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 custom-scrollbar">
            {filteredUsers?.map(user => (
              <label 
                key={user._id} 
                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${selectedUsers.includes(user._id) ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <div className="relative">
                    <input 
                      type="checkbox" 
                      className="hidden" // Hide native checkbox for custom UI
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, user._id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                      }}
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUsers.includes(user._id) ? "bg-blue-600 border-blue-600" : "border-slate-300 dark:border-slate-600"}`}>
                        {selectedUsers.includes(user._id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                </div>
                <img src={user.imageUrl || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full object-cover" alt="" />
                <span className="text-sm font-medium dark:text-slate-200">{user.name}</span>
              </label>
            ))}
          </div>
          <button 
            onClick={handleCreateGroup}
            disabled={selectedUsers.length < 2 || !groupName}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
          >
            Create Group ({selectedUsers.length})
          </button>
        </div>
      ) : (
        /* Standard Chat List */
        <>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 dark:placeholder-slate-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Direct Messages</div>
            {filteredUsers?.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm italic">No users found</div>
            ) : (
                filteredUsers?.map((user) => (
                    <button
                      key={user._id}
                      onClick={async () => {
                        const id = await startChat({ otherUserId: user._id });
                        onSelectChat(id, user._id);
                      }}
                      className={`w-full flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-900 transition-all ${selectedUserId === user._id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={user.imageUrl || "https://via.placeholder.com/48"} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
                        {user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />}
                      </div>
                      <div className="flex-1 text-left truncate">
                        <div className={`font-semibold transition-colors ${selectedUserId === user._id ? "text-blue-600 dark:text-blue-400" : "dark:text-slate-200"}`}>{user.name}</div>
                        <div className="text-xs text-slate-500">{user.isOnline ? "Online" : "Away"}</div>
                      </div>
                    </button>
                  ))
            )}
          </div>
        </>
      )}
    </div>
  );
}