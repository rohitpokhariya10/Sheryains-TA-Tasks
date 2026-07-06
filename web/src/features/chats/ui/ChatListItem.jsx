import { useDispatch, useSelector } from "react-redux";
import { motion, useReducedMotion } from "framer-motion";
import { Image, Users } from "lucide-react";
import { Avatar } from "../../../shared/ui/components/Avatar.jsx";
import { formatTime } from "../../../shared/ui/lib/format.js";
import { prefersReduced, sidebarRow } from "../../../shared/ui/motion/motionVariants.js";
import {
  setActiveChat,
  selectActiveChatId,
} from "../state/chatSlice.js";
import styles from "./ChatListItem.module.css";

/** A single conversation row in the sidebar. */
export function ChatListItem({ chat }) {
  const dispatch = useDispatch();
  const activeChatId = useSelector(selectActiveChatId);
  const reduceMotion = useReducedMotion();
  const isActive = activeChatId === chat.id;

  const last = chat.lastMessage;
  const preview = last ? last.content : "No messages yet";
  const isImage = last?.messageType === "image";
  const online = Boolean(chat.isOnline || chat.presence?.isOnline);

  return (
    <motion.button
      type="button"
      className={`${styles.item} ${isActive ? styles.itemActive : ""} ${
        online ? styles.online : styles.offline
      }`}
      onClick={() => dispatch(setActiveChat(chat.id))}
      variants={sidebarRow}
      initial={reduceMotion ? { opacity: 0 } : "hidden"}
      animate={reduceMotion ? prefersReduced : "show"}
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : "press"}
    >
      <span className={styles.rail} aria-hidden="true" />
      <Avatar
        src={chat.avatar?.url}
        name={chat.title}
        size={48}
        group={chat.isGroup}
      />
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.name}>{chat.title}</span>
          {chat.lastMessageAt && (
            <span className={styles.time}>
              {formatTime(chat.lastMessageAt)}
            </span>
          )}
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.preview}>
            {isImage && <Image size={14} />}
            {isImage ? "Photo" : preview}
          </span>
          {chat.isGroup && (
            <span className={styles.badge}>
              <Users size={12} />
              Group
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
