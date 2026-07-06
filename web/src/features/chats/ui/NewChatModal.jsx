import { useRef, useState } from "react";
import { FiCamera, FiCheck, FiSearch, FiX } from "react-icons/fi";
import { Avatar } from "../../../shared/ui/components/Avatar.jsx";
import { IconButton } from "../../../shared/ui/components/IconButton.jsx";
import { Spinner } from "../../../shared/ui/components/Spinner.jsx";
import { useUserSearch } from "../../users/hooks/useUsers.js";
import { useOpenDirectChat, useCreateGroup } from "../hooks/useChats.js";
import { useImageKitUpload } from "../../uploads/hooks/useImageKitUpload.js";
import styles from "./NewChatModal.module.css";

/**
 * Modal to start a new 1-to-1 chat or create a group.
 * Group avatars upload to ImageKit before creation.
 */
export function NewChatModal({ onClose }) {
  const [tab, setTab] = useState("direct");
  const [term, setTerm] = useState("");
  const { data: users = [], isFetching } = useUserSearch(term);

  const openDirect = useOpenDirectChat();
  const createGroup = useCreateGroup();
  const { upload, isUploading } = useImageKitUpload();
  const fileRef = useRef(null);

  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const createGroupError =
    createGroup.error?.response?.data?.message || createGroup.error?.message;

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
                ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const startDirect = (userId) => {
    openDirect.mutate(userId, { onSuccess: onClose });
  };

  const onPickGroupAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const media = await upload(file, { folder: "/chotuapp/groups" });
    setGroupAvatar(media);
  };

  const submitGroup = () => {
    if (!groupName.trim() || selected.length < 1) return;
    createGroup.mutate(
      {
        name: groupName.trim(),
        memberIds: selected.map((u) => u.id),
        avatar: groupAvatar || undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Compose</span>
            <h2>New conversation</h2>
          </div>
          <IconButton label="Close" className={styles.close} onClick={onClose}>
            <FiX size={22} />
          </IconButton>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              tab === "direct" ? styles.tabActive : ""
            }`}
            onClick={() => setTab("direct")}
          >
            Direct message
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              tab === "group" ? styles.tabActive : ""
            }`}
            onClick={() => setTab("group")}
          >
            New group
          </button>
        </div>

        <div className={styles.searchBox}>
          <label className={styles.searchField}>
            <FiSearch size={16} />
            <input
              placeholder="Search users by name or @username"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              autoFocus
            />
          </label>
        </div>

        <div className={styles.list}>
          {isFetching && <Spinner center />}
          {!isFetching &&
            users.map((user) => {
              const isSelected = selected.find((u) => u.id === user.id);
              return (
                <button
                  type="button"
                  key={user.id}
                  className={styles.userRow}
                  onClick={() =>
                    tab === "direct" ? startDirect(user.id) : toggleSelect(user)
                  }
                >
                  <Avatar src={user.avatar?.url} name={user.name} size={44} />
                  <span className={styles.userText}>
                    <strong className={styles.userName}>{user.name}</strong>
                    <small className={styles.userSub}>@{user.username}</small>
                  </span>
                  {tab === "group" && isSelected && (
                    <FiCheck className={styles.check} size={22} />
                  )}
                </button>
              );
            })}
          {!isFetching && term.trim() && users.length === 0 && (
            <div className={styles.emptySearch}>No users found</div>
          )}
        </div>

        {tab === "group" && (
          <div className={styles.groupBar}>
            {selected.length > 0 && (
              <div className={styles.selectedStrip}>
                {selected.slice(0, 4).map((user) => (
                  <span key={user.id} className={styles.selectedChip}>
                    <Avatar src={user.avatar?.url} name={user.name} size={22} />
                    {user.name}
                  </span>
                ))}
                {selected.length > 4 && (
                  <span className={styles.selectedChip}>
                    +{selected.length - 4}
                  </span>
                )}
              </div>
            )}

            <div className={styles.groupNameRow}>
              <div
                className={styles.avatarPick}
                onClick={() => fileRef.current?.click()}
              >
                <Avatar src={groupAvatar?.url} size={44} group />
                <span className={styles.avatarBadge}>
                  <FiCamera size={11} />
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onPickGroupAvatar}
                />
              </div>
              <input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <span className={styles.selectedCount}>
              {selected.length} member{selected.length === 1 ? "" : "s"} selected
              {isUploading && " - uploading avatar..."}
            </span>
            {createGroupError && (
              <div className={styles.error}>{createGroupError}</div>
            )}
            <button
              type="button"
              className={styles.createBtn}
              disabled={
                !groupName.trim() ||
                selected.length < 1 ||
                createGroup.isPending ||
                isUploading
              }
              onClick={submitGroup}
            >
              {createGroup.isPending ? "Creating..." : "Create group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
