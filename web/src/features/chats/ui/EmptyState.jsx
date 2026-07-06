import { MessageCircle } from "lucide-react";
import styles from "./EmptyState.module.css";

export function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.mark}>
        <MessageCircle size={34} />
      </div>
      <h2>Select a conversation</h2>
      <p>Choose a chat from the sidebar or create a new group to start messaging.</p>
    </div>
  );
}
