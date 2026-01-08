import styles from "./MessageBubble.module.css";

export default function MessageBubble({ role, content, time }) {
  const isUser = role === "user";

  return (
    <div
      className={`${styles.wrapper} ${
        isUser ? styles.user : styles.assistant
      }`}
    >
      <div className={styles.bubble}>
        <div>{content}</div>
        <div className={styles.time}>{time}</div>
      </div>
    </div>
  );
}
