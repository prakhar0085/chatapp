import { useChatStore } from "../store/useChatStore";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    markMessagesAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (selectedUser && lastMessage && lastMessage.senderId === selectedUser._id && !lastMessage.isRead) {
        markMessagesAsRead(selectedUser._id);
    }
  }, [messages, selectedUser, markMessagesAsRead]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}


              {message.audio && (
                <div className="mb-2">
                  <audio src={message.audio} controls className="max-w-[200px] h-8 sm:max-w-[250px]" />
                </div>
              )}

              {message.text && (
                 <div className="min-w-0 break-words"> 
                   <ReactMarkdown 
                      components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold my-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold my-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold text-inherit" {...props} />,
                        code: ({node, inline, className, children, ...props}) => (
                           inline 
                             ? <code className="bg-base-300 px-1 rounded text-sm" {...props}>{children}</code>
                             : <code className="block bg-base-300 p-2 rounded text-sm my-2 overflow-x-auto" {...props}>{children}</code>
                        )
                      }}
                   >
                     {message.text}
                   </ReactMarkdown>
                 </div>
              )}

              {/* Message Status - only for sender */}
              {message.senderId === authUser._id && (
                <div className="flex justify-end mt-1">
                  {message.isRead ? (
                    <CheckCheck size={14} className="text-blue-500" />
                  ) : (
                    <Check size={14} className="text-base-content/40" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
