import React from "react";
import ConversationListItem from "./ConversationListItem";
import NewChatButton from "./NewChatButton";

export default function ConversationList({
  chats,
  activeChatId,
  loading,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) {
  return (
    <div>
      <NewChatButton
        onClick={onNewChat}
      />

      {loading && (
        <div>
          Loading chats...
        </div>
      )}

      {!loading &&
        chats.length === 0 && (
          <div>
            No conversations
          </div>
        )}

      {!loading &&
        chats.map((chat) => (
          <ConversationListItem
            key={chat.chatId}
            chat={chat}
            active={
              chat._id ===
              activeChatId
            }
            onClick={() =>
              onSelectChat(
                chat.chatId
              )
            }
            onDelete={() =>
              onDeleteChat(
                chat._id
              )
            }
          />
        ))}
    </div>
  );
}