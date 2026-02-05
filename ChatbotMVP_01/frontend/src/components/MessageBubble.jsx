import styles from './MessageBubble.module.css'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <p>{message.content}</p>
    </div>
  )
}

export default MessageBubble
