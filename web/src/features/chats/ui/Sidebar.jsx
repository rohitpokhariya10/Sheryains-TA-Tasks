import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, useReducedMotion } from "framer-motion";
import { Archive, ChevronDown, ChevronRight, Edit3, LogOut, Search, Users } from "lucide-react";
import { Spinner } from "../../../shared/ui/components/Spinner.jsx";
import { Avatar } from "../../../shared/ui/components/Avatar.jsx";
import { IconButton } from "../../../shared/ui/components/IconButton.jsx";
import { ProductMark } from "../../../shared/ui/components/ProductMark.jsx";
import { PRODUCT } from "../../../shared/config/product.js";
import { listStagger, prefersReduced } from "../../../shared/ui/motion/motionVariants.js";
import { ChatListItem } from "./ChatListItem.jsx";
import { useChats } from "../hooks/useChats.js";
import { useOpenDirectChat } from "../hooks/useChats.js";
import { useUserSearch } from "../../users/hooks/useUsers.js";
import { useCurrentUser, useAuthActions } from "../../auth/hooks/useAuth.js";
import { setActiveChat } from "../state/chatSlice.js";
import styles from "./Sidebar.module.css";

/** Left pane: profile header, search (chats + users), and the chat list. */
export function Sidebar({ onNewChat, onOpenProfile }) {
  const dispatch = useDispatch();
  const me = useCurrentUser();
  const { logout } = useAuthActions();
  const { data: chats = [], isLoading } = useChats();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const reduceMotion = useReducedMotion();
  const { data: users = [], isFetching: searching } = useUserSearch(term);
  const openDirect = useOpenDirectChat();

  const query = term.trim().toLowerCase();
  const filteredChats = chats.filter((chat) => {
    const matchesQuery = query
      ? chat.title?.toLowerCase().includes(query)
      : true;
    const matchesFilter =
      filter === "all" ||
      (filter === "groups" && chat.isGroup) ||
      (filter === "direct" && !chat.isGroup);
    return matchesQuery && matchesFilter;
  });

  const filterOptions = [
    { id: "all", label: "All", count: chats.length },
    { id: "groups", label: "Groups", count: chats.filter((c) => c.isGroup).length },
    { id: "direct", label: "Direct", count: chats.filter((c) => !c.isGroup).length },
  ];
  const pinnedChats = filteredChats.slice(0, Math.min(3, filteredChats.length));
  const activeChats = filteredChats.slice(pinnedChats.length);

  const startChatWithUser = (userId) => {
    openDirect.mutate(userId, {
      onSuccess: (chat) => {
        dispatch(setActiveChat(chat.id));
        setTerm("");
      },
    });
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.topbar}>
        <div className={styles.product}>
          <ProductMark compact />
          <div className={styles.productCopy}>
            <strong>{PRODUCT.name}</strong>
            <span>Messaging</span>
          </div>
        </div>
        <IconButton
          label="Log out"
          variant="danger"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut size={19} />
        </IconButton>
      </div>

      <button className={styles.profileCard} onClick={onOpenProfile}>
        <Avatar src={me?.avatar?.url} name={me?.name} size={46} />
        <span className={styles.profileText}>
          <strong>{me?.name || "Your profile"}</strong>
          <small>{me?.username ? `@${me.username}` : "Available"}</small>
        </span>
        <ChevronRight size={18} />
      </button>

      <div className={styles.statusBar} aria-label="Status updates">
        {[me, ...chats.slice(0, 4)].filter(Boolean).map((item, index) => (
          <button key={item.id || item._id || index} type="button" className={styles.story}>
            <span className={styles.storyRing}>
              <Avatar src={item.avatar?.url} name={item.name || item.title} size={38} />
            </span>
            <small>{index === 0 ? "You" : item.title || item.name}</small>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div>
          <span className={styles.kicker}>Inbox</span>
          <h1>Conversations</h1>
        </div>
        <IconButton label="New conversation" variant="primary" onClick={onNewChat}>
          <Edit3 size={18} />
        </IconButton>
      </div>

      <div className={styles.searchWrap}>
        <label className={styles.search} htmlFor="sidebar-search">
          <Search size={16} />
          <input
            id="sidebar-search"
            placeholder="Search chats or people"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Conversation filters">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            className={`${styles.filter} ${
              filter === option.id ? styles.filterActive : ""
            }`}
            onClick={() => setFilter(option.id)}
          >
            <span>{option.label}</span>
            <strong>{option.count}</strong>
          </button>
        ))}
      </div>

      <motion.div
        className={styles.list}
        variants={listStagger}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? prefersReduced : "show"}
      >
        {isLoading && <Spinner center />}

        {!isLoading && (
          <>
            {filteredChats.length > 0 && (
              <>
                {term.trim() && <div className={styles.sectionLabel}>Chats</div>}
                {!term.trim() && pinnedChats.length > 0 && (
                  <>
                    <div className={styles.sectionLabel}>Pinned</div>
                    {pinnedChats.map((chat) => (
                      <ChatListItem key={chat.id} chat={chat} />
                    ))}
                  </>
                )}
                {activeChats.length > 0 && (
                  <>
                    {!term.trim() && <div className={styles.sectionLabel}>Recent</div>}
                    {(term.trim() ? filteredChats : activeChats).map((chat) => (
                      <ChatListItem key={chat.id} chat={chat} />
                    ))}
                  </>
                )}
                {!term.trim() && (
                  <button
                    type="button"
                    className={styles.archiveToggle}
                    onClick={() => setShowArchived((value) => !value)}
                  >
                    <Archive size={16} />
                    Archived chats
                    <ChevronDown
                      size={16}
                      className={showArchived ? styles.chevronOpen : ""}
                    />
                  </button>
                )}
                {showArchived && (
                  <div className={styles.archivedEmpty}>
                    No archived conversations
                  </div>
                )}
              </>
            )}

            {term.trim() && (
              <>
                <div className={styles.sectionLabel}>
                  {searching ? "Searching users..." : "Users"}
                </div>
                {users.length === 0 && !searching && (
                  <div className={styles.empty}>No users found</div>
                )}
                {users.map((u) => (
                  <UserSearchRow
                    key={u.id}
                    user={u}
                    onClick={() => startChatWithUser(u.id)}
                  />
                ))}
              </>
            )}

            {!term.trim() && filteredChats.length === 0 && (
              <div className={styles.empty}>
                <Users size={36} />
                <strong>No conversations</strong>
                <span>Your inbox will appear here.</span>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function UserSearchRow({ user, onClick }) {
  return (
    <button type="button" className={styles.userRow} onClick={onClick}>
      <Avatar src={user.avatar?.url} name={user.name} size={44} />
      <span className={styles.userText}>
        <strong>{user.name}</strong>
        <small>
          @{user.username} - {user.about}
        </small>
      </span>
      <ChevronRight className={styles.userChevron} size={17} />
    </button>
  );
}
