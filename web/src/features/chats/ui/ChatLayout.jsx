import { useState } from "react";
import { useSelector } from "react-redux";
import { Sidebar } from "./Sidebar.jsx";
import { NewChatModal } from "./NewChatModal.jsx";
import { ChatWindow } from "../../messages/ui/ChatWindow.jsx";
import { ProfileDrawer } from "../../users/ui/ProfileDrawer.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { selectActiveChatId } from "../state/chatSlice.js";
import styles from "./ChatLayout.module.css";

/**
 * Authenticated product workspace. Mobile collapses to one pane based on the
 * selected conversation.
 */
export function ChatLayout() {
  const activeChatId = useSelector(selectActiveChatId);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <aside
          className={`${styles.sidebar} ${
            activeChatId ? styles.sidebarHidden : ""
          }`}
        >
          {showProfile ? (
            <ProfileDrawer onClose={() => setShowProfile(false)} />
          ) : (
            <Sidebar
              onNewChat={() => setShowNewChat(true)}
              onOpenProfile={() => setShowProfile(true)}
            />
          )}
        </aside>

        <main
          className={`${styles.main} ${
            activeChatId ? "" : styles.mainHidden
          }`}
        >
          {activeChatId ? <ChatWindow chatId={activeChatId} /> : <EmptyState />}
        </main>
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </div>
  );
}
