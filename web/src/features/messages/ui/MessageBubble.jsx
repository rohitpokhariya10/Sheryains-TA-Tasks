import { motion, useReducedMotion } from "framer-motion";
import { Mic2 } from "lucide-react";
import { Ticks } from "../../../shared/ui/components/Ticks.jsx";
import { formatTime } from "../../../shared/ui/lib/format.js";
import { bubble, prefersReduced } from "../../../shared/ui/motion/motionVariants.js";
import styles from "./MessageBubble.module.css";

/** A single message bubble with image/text body, timestamp and ticks. */
export function MessageBubble({ message, isMine, isGroup }) {
  const reduceMotion = useReducedMotion();
  const reactions = message.reactions || [];

  return (
    <motion.div
      className={`${styles.row} ${isMine ? styles.rowOut : styles.rowIn}`}
      custom={isMine}
      initial={reduceMotion ? { opacity: 0 } : "hidden"}
      animate={reduceMotion ? prefersReduced : "show"}
      variants={bubble}
    >
      <motion.div
        layout
        className={`${styles.bubble} ${
          isMine ? styles.bubbleOut : styles.bubbleIn
        }`}
      >
        {isGroup && !isMine && (
          <div className={styles.sender}>{message.sender?.name}</div>
        )}

        {message.replyTo && (
          <div className={styles.replyQuote}>
            <strong>{message.replyTo.sender?.name || "Reply"}</strong>
            <span>{message.replyTo.content || "Media message"}</span>
          </div>
        )}

        {message.messageType === "image" && message.media?.url && (
          <a href={message.media.url} target="_blank" rel="noreferrer">
            <img
              className={styles.image}
              src={message.media.url}
              alt={message.media.name || "image"}
            />
          </a>
        )}

        {message.messageType === "audio" && (
          <VoiceMessagePlayer duration={message.duration || "0:18"} />
        )}

        {message.content && <div className={styles.text}>{message.content}</div>}

        {reactions.length > 0 && (
          <div className={styles.reactions}>
            {reactions.slice(0, 4).map((reaction, index) => (
              <span key={`${reaction.emoji || reaction}-${index}`}>
                {reaction.emoji || reaction}
              </span>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.createdAt)}</span>
          {isMine && (
            <Ticks status={message.status} pending={message.pending} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function VoiceMessagePlayer({ duration }) {
  const bars = [16, 26, 18, 34, 22, 30, 14, 28, 20, 36, 18, 26, 16];

  return (
    <div className={styles.voice}>
      <span className={styles.voiceIcon}>
        <Mic2 size={16} />
      </span>
      <div className={styles.waveform} aria-hidden="true">
        {bars.map((height, index) => (
          <span key={index} style={{ height }} />
        ))}
      </div>
      <span className={styles.duration}>{duration}</span>
    </div>
  );
}
