import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Bot, Plus, Copy } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, connectByCode, unreadCounts } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [friendCode, setFriendCode] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    const success = await connectByCode(friendCode.trim());
    if (success) setFriendCode("");
  };

  const copyCode = () => {
    if (authUser?.chatCode) {
        navigator.clipboard.writeText(authUser.chatCode);
        toast.success("Code copied!");
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id) || user.email === "ai@bot.com")
    : users;

  // Sort to show AI Assistant first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.email === "ai@bot.com") return -1;
    if (b.email === "ai@bot.com") return 1;
    return 0;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          
          {/* Your Own Code Badge */}
          <div 
            onClick={copyCode}
            className="hidden lg:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-all text-xs font-mono"
            title="Click to copy your chat code"
          >
            {authUser?.chatCode || "---"}
            <Copy size={12} />
          </div>
        </div>

        {/* Add Friend Input */}
        <form onSubmit={handleAddFriend} className="hidden lg:flex items-center gap-2 mb-4">
           <input 
              type="text" 
              placeholder="Enter Chat Code..."
              className="input input-bordered input-sm flex-1 text-xs"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
           />
           <button type="submit" className="btn btn-primary btn-sm btn-square">
              <Plus size={16} />
           </button>
        </form>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">


        {sortedUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {user.email === "ai@bot.com" ? (
                <span
                  className="absolute -bottom-1 -right-1 size-5 bg-gradient-to-br from-purple-500 to-pink-500 
                  rounded-full ring-2 ring-zinc-900 flex items-center justify-center"
                >
                  <Bot className="size-3 text-white" />
                </span>
              ) : (
                onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:flex flex-1 justify-between items-center min-w-0">
              <div className="text-left">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {user.email === "ai@bot.com" 
                    ? "🤖 AI Assistant" 
                    : onlineUsers.includes(user._id) 
                      ? "Online" 
                      : "Offline"}
                </div>
              </div>
              
              {/* Unread Count Badge */}
              {unreadCounts[user._id] > 0 && (
                <div className="bg-primary text-primary-content size-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
          </button>
        ))}

        {sortedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
