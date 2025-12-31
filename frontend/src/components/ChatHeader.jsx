import { X, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setCallActive } = useCallStore();

  const isTyping = typingUsers.includes(selectedUser?._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "https://avatar.iran.liara.run/public/boy"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
             <p className="text-sm text-base-content/70">
              {isTyping ? (
                <span className="text-primary italic animate-pulse">Typing...</span>
              ) : (
                onlineUsers.includes(selectedUser._id) || selectedUser.email === "ai@bot.com" ? "Online" : "Offline"
              )}
            </p> 
          </div>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-2">
            <button
                onClick={() => setCallActive(true)}
                className="btn btn-circle btn-sm btn-ghost"
                title="Video Call"
            >
                <Video className="size-5" />
            </button>
            
            {/* Close button */}
            <button onClick={() => setSelectedUser(null)}>
              <X />
            </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
