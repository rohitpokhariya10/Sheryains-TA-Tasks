import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image, Mic2, Paperclip, Send, Smile, Video, X, FileText } from "lucide-react";
import { IconButton } from "../../../shared/ui/components/IconButton.jsx";
import { menuFan } from "../../../shared/ui/motion/motionVariants.js";
import { useSendMessage } from "../hooks/useSendMessage.js";
import { useImageKitUpload } from "../../uploads/hooks/useImageKitUpload.js";
import { getSocket } from "../../../lib/socket.js";
import styles from "./MessageInput.module.css";

/**
 * Composer for text + image messages.
 * - Text: emits typing indicators and sends over the socket.
 * - Image: uploads to ImageKit first, then sends the media metadata.
 */
export function MessageInput({ chatId }) {
  const send = useSendMessage(chatId);
  const { upload, isUploading, progress } = useImageKitUpload();
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState(null); // { file, previewUrl }
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage?.previewUrl]);

  const emitTyping = (isTyping) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit(isTyping ? "typing:start" : "typing:stop", { chatId });
  };

  const onTextChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
    }
    e.target.value = "";
  };

  const submit = async () => {
    // Image message: upload to ImageKit, then send media metadata.
    if (pendingImage) {
      try {
        const media = await upload(pendingImage.file, { folder: "/chotuapp/chat" });
        send({ messageType: "image", media, content: text.trim() });
      } catch {
        // upload hook already tracks the error state
        return;
      }
      setPendingImage(null);
      setText("");
      return;
    }

    // Text message.
    const content = text.trim();
    if (!content) return;
    send({ messageType: "text", content });
    setText("");
    emitTyping(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = (text.trim() || pendingImage) && !isUploading;

  return (
    <div className={styles.wrap}>
      {pendingImage && (
        <div className={styles.preview}>
          <img
            className={styles.previewImg}
            src={pendingImage.previewUrl}
            alt="preview"
          />
          <div className={styles.previewBody}>
            <div className={styles.previewName}>
              <Image size={15} />
              <span>{pendingImage.file.name}</span>
            </div>
            {isUploading && (
              <div className={styles.progress}>
                <span>Uploading... {progress}%</span>
                <div className={styles.progressTrack}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
          <IconButton
            label="Remove image"
            size="sm"
            onClick={() => setPendingImage(null)}
          >
            <X size={20} />
          </IconButton>
        </div>
      )}

      <div className={styles.composer}>
        <div className={styles.menuAnchor}>
          <IconButton
            label="Open emoji menu"
            variant="muted"
            onClick={() => {
              setShowEmoji((value) => !value);
              setShowAttach(false);
            }}
          >
            <Smile size={21} />
          </IconButton>
          <AnimatePresence>
            {showEmoji && (
              <motion.div className={styles.emojiTray} initial="hidden" animate="show" exit="exit">
                {["👍", "❤️", "😂", "🔥", "🎉", "🙏"].map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    custom={index}
                    variants={menuFan}
                    onClick={() => {
                      setText((value) => `${value}${emoji}`);
                      setShowEmoji(false);
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.menuAnchor}>
        <IconButton
          label="Open attachment menu"
          variant="muted"
          onClick={() => {
            setShowAttach((value) => !value);
            setShowEmoji(false);
          }}
        >
          <Paperclip size={22} />
        </IconButton>
          <AnimatePresence>
            {showAttach && (
              <motion.div className={styles.attachTray} initial="hidden" animate="show" exit="exit">
                <motion.button
                  type="button"
                  custom={0}
                  variants={menuFan}
                  onClick={() => {
                    fileRef.current?.click();
                    setShowAttach(false);
                  }}
                >
                  <Image size={16} />
                  Image
                </motion.button>
                <motion.button type="button" custom={1} variants={menuFan}>
                  <Video size={16} />
                  Video
                </motion.button>
                <motion.button type="button" custom={2} variants={menuFan}>
                  <FileText size={16} />
                  File
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickImage}
        />

        <textarea
          className={styles.input}
          rows={1}
          placeholder="Write a message"
          value={text}
          onChange={onTextChange}
          onKeyDown={onKeyDown}
        />

        <IconButton label="Record voice message" variant="muted">
          <Mic2 size={20} />
        </IconButton>

        <IconButton
          label="Send message"
          className={styles.send}
          variant="primary"
          size="lg"
          onClick={submit}
          disabled={!canSend}
        >
          <Send size={20} />
        </IconButton>
      </div>
    </div>
  );
}
