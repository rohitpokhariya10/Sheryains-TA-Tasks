import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiCamera, FiCheck, FiEdit2 } from "react-icons/fi";
import { Avatar } from "../../../shared/ui/components/Avatar.jsx";
import { IconButton } from "../../../shared/ui/components/IconButton.jsx";
import { useCurrentUser } from "../../auth/hooks/useAuth.js";
import { useUpdateProfile } from "../hooks/useUsers.js";
import { useImageKitUpload } from "../../uploads/hooks/useImageKitUpload.js";
import styles from "./ProfileDrawer.module.css";

/**
 * Profile view/editor. Avatar changes upload first, then profile metadata saves.
 */
export function ProfileDrawer({ onClose }) {
  const me = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const { upload, isUploading, progress } = useImageKitUpload();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(me?.name || "");
  const [about, setAbout] = useState(me?.about || "");

  useEffect(() => {
    setName(me?.name || "");
    setAbout(me?.about || "");
  }, [me?.name, me?.about]);

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const media = await upload(file, { folder: "/chotuapp/avatars" });
    updateProfile.mutate({ avatar: media });
  };

  const saveField = (field, value) => {
    updateProfile.mutate({ [field]: value });
    setEditing(null);
  };

  return (
    <div className={styles.drawer}>
      <header className={styles.header}>
        <IconButton label="Back" className={styles.back} onClick={onClose}>
          <FiArrowLeft size={22} />
        </IconButton>
        <div>
          <span>Account</span>
          <h2>Profile</h2>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.identity}>
          <button
            type="button"
            className={styles.avatarWrap}
            onClick={() => fileRef.current?.click()}
          >
            <Avatar src={me?.avatar?.url} name={me?.name} size={148} />
            <span className={styles.avatarOverlay}>
              <FiCamera size={22} />
              {isUploading ? `Uploading ${progress}%` : "Change photo"}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickAvatar}
          />
          <div className={styles.identityText}>
            <strong>{me?.name}</strong>
            <span>@{me?.username}</span>
          </div>
        </section>

        <ProfileField
          label="Display name"
          value={me?.name}
          editing={editing === "name"}
          inputValue={name}
          onInput={setName}
          onEdit={() => setEditing("name")}
          onSave={() => saveField("name", name)}
        />

        <ProfileField
          label="About"
          value={me?.about || "No status set"}
          editing={editing === "about"}
          inputValue={about}
          onInput={setAbout}
          onEdit={() => setEditing("about")}
          onSave={() => saveField("about", about)}
        />

        <section className={styles.section}>
          <span className={styles.label}>Username</span>
          <span className={styles.readonly}>@{me?.username}</span>
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  inputValue,
  onInput,
  onEdit,
  onSave,
}) {
  return (
    <section className={styles.section}>
      <span className={styles.label}>{label}</span>
      <div className={styles.value}>
        {editing ? (
          <>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
            />
            <IconButton label={`Save ${label}`} size="sm" onClick={onSave}>
              <FiCheck size={18} />
            </IconButton>
          </>
        ) : (
          <>
            <span>{value}</span>
            <IconButton label={`Edit ${label}`} size="sm" onClick={onEdit}>
              <FiEdit2 size={17} />
            </IconButton>
          </>
        )}
      </div>
    </section>
  );
}
