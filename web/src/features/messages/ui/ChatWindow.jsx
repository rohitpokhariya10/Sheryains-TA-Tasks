import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Lock, MessageSquare, MoreVertical, Phone, Video, X } from "lucide-react";
import { Avatar } from "../../../shared/ui/components/Avatar.jsx";
import { Spinner } from "../../../shared/ui/components/Spinner.jsx";
import { IconButton } from "../../../shared/ui/components/IconButton.jsx";
import { MessageBubble } from "./MessageBubble.jsx";
import { MessageInput } from "./MessageInput.jsx";
import { useMessages } from "../hooks/useMessages.js";
import { useChat } from "../../chats/hooks/useChats.js";
import { getSocket } from "../../../lib/socket.js";
import {
  setActiveChat,
  selectTypingInChat,
  selectPresence,
} from "../../chats/state/chatSlice.js";
import { selectCurrentUser } from "../../auth/state/authSlice.js";
import { formatDayLabel, formatLastSeen } from "../../../shared/ui/lib/format.js";
import { drawer } from "../../../shared/ui/motion/motionVariants.js";
import styles from "./ChatWindow.module.css";

/** The conversation view: header, scrollable history, and the composer. */
export function ChatWindow({ chatId }) {
  const dispatch = useDispatch();
  const me = useSelector(selectCurrentUser);
  const { data: chat } = useChat(chatId);
  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(chatId);

  const typingUsers = useSelector(selectTypingInChat(chatId));
  const bottomRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);

  // Other participant for 1-to-1 presence.
  const otherMember = chat?.isGroup
    ? null
    : chat?.members?.find((m) => m._id !== me?.id);
  const presence = useSelector(selectPresence(otherMember?._id));
  const isOtherOnline = Boolean(presence?.isOnline || otherMember?.isOnline);

  // On open / new message: mark read (blue tick) and scroll to bottom.
  useEffect(() => {
    const socket = getSocket();
    if (socket && chatId) {
      socket.emit("chat:join", { chatId });
      socket.emit("message:delivered", { chatId });
      socket.emit("message:read", { chatId });
    }
  }, [chatId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const statusText = () => {
    if (typingUsers.length > 0)
      return <span className={styles.typing}>typing...</span>;
    if (chat?.isGroup)
      return `${chat.members?.length || 0} members`;
    if (presence?.isOnline) return "online";
    if (presence?.lastSeen) return formatLastSeen(presence.lastSeen);
    if (otherMember?.isOnline) return "online";
    return otherMember?.about || "";
  };

  let lastDay = null;

  return (
    <div className={styles.shell}>
      <div className={styles.window}>
        <header className={styles.header}>
        <IconButton
          className={styles.backButton}
          label="Back to inbox"
          onClick={() => dispatch(setActiveChat(null))}
        >
          <ArrowLeft size={22} />
        </IconButton>
        <Avatar
          src={chat?.avatar?.url}
          name={chat?.title}
          size={44}
          group={chat?.isGroup}
        />
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>{chat?.title || "..."}</div>
          <div className={styles.headerStatus}>
            {!chat?.isGroup && (
              <span
                className={`${styles.presenceDot} ${
                  isOtherOnline ? styles.presenceOnline : styles.presenceMuted
                }`}
              />
            )}
            {statusText()}
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.secureBadge}>
            <Lock size={13} />
            Protected
          </span>
          <IconButton label="Start voice call">
            <Phone size={18} />
          </IconButton>
          <IconButton label="Start video call">
            <Video size={18} />
          </IconButton>
          <IconButton label="Open chat details" onClick={() => setShowDetails(true)}>
            <MoreVertical size={18} />
          </IconButton>
        </div>
        </header>

        <div className={styles.messages} aria-live="polite">
        {isLoading && <Spinner center />}

        {!isLoading && (
          <>
            {hasNextPage && (
              <button
                className={styles.loadMore}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load older messages"}
              </button>
            )}

            {messages.length === 0 && (
              <div className={styles.emptyThread}>
                <MessageSquare size={30} />
                <strong>No messages yet</strong>
                <span>This conversation is ready.</span>
              </div>
            )}

            {messages.map((msg) => {
              const day = formatDayLabel(msg.createdAt);
              const showDay = day !== lastDay;
              lastDay = day;
              const isMine = (msg.sender?._id || msg.sender) === me?.id;

              return (
                <div key={msg._id}>
                  {showDay && <div className={styles.dayDivider}>{day}</div>}
                  <MessageBubble
                    message={msg}
                    isMine={isMine}
                    isGroup={chat?.isGroup}
                  />
                </div>
              );
            })}
          </>
        )}

        <div ref={bottomRef} />
        </div>

        <MessageInput chatId={chatId} />
      </div>

      <AnimatePresence>
        {showDetails && (
          <ContactInfoDrawer
            chat={chat}
            otherMember={otherMember}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactInfoDrawer({ chat, otherMember, onClose }) {
  const title = chat?.title || otherMember?.name || "Conversation";
  const mediaCount = chat?.sharedMediaCount || 0;

  return (
    <motion.aside
      className={styles.detailDrawer}
      variants={drawer}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className={styles.drawerHeader}>
        <div>
          <span>Details</span>
          <h2>{chat?.isGroup ? "Group info" : "Contact info"}</h2>
        </div>
        <IconButton label="Close details" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>

      <div className={styles.drawerBody}>
        <Avatar src={chat?.avatar?.url || otherMember?.avatar?.url} name={title} size={96} group={chat?.isGroup} />
        <strong>{title}</strong>
        <span>{chat?.isGroup ? `${chat.members?.length || 0} members` : otherMember?.about || "Available"}</span>

        <div className={styles.infoGrid}>
          <div>
            <small>Shared media</small>
            <b>{mediaCount}</b>
          </div>
          <div>
            <small>Encryption</small>
            <b>On</b>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
