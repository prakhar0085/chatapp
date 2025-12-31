import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Mic, Square } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, messages, selectedUser, getSuggestions } = useChatStore();
  const [suggestions, setSuggestions] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    
    // Typing indicator logic
    const socket = useAuthStore.getState().socket;
    if (socket && selectedUser) {
        socket.emit("typing", { receiverId: selectedUser._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { receiverId: selectedUser._id });
        }, 2000);
    }
  };

  // Fetch suggestions when the last message changes AND it's from the other user
  useEffect(() => {
    if (!messages.length || !selectedUser) return;
    
    const lastMsg = messages[messages.length - 1];
    const isFromOtherUser = lastMsg.senderId === selectedUser._id;
    
    if (isFromOtherUser && lastMsg.text) {
        getSuggestions(lastMsg.text).then(setSuggestions);
    } else {
        setSuggestions([]);
    }
  }, [messages, selectedUser, getSuggestions]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;

    try {
      const socket = useAuthStore.getState().socket;
      if (socket && selectedUser) {
          socket.emit("stopTyping", { receiverId: selectedUser._id });
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }

      let audioBase64 = null;
      if (audioBlob) {
        const reader = new FileReader();
        audioBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        audio: audioBase64
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setAudioBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {audioBlob && (
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-base-200 p-2 rounded-lg flex items-center gap-2">
             <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 w-48 sm:w-64" />
             <button
               onClick={() => setAudioBlob(null)}
               className="btn btn-ghost btn-circle btn-xs"
             >
                <X size={14} />
             </button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {suggestions.map((reply, idx) => (
             <button 
                key={idx}
                onClick={() => setText(reply)}
                className="btn btn-xs btn-outline btn-info rounded-full normal-case"
             >
                {reply}
              </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            value={text}
            onChange={handleInputChange}
            disabled={isRecording}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* Voice Record Button */}
          <button
            type="button"
            className={`btn btn-circle ${isRecording ? "bg-red-500 text-white animate-pulse" : "text-zinc-400"}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !audioBlob}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
