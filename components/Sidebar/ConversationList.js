import React, { useMemo, useState } from "react";

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
  const [searchText, setSearchText] =
    useState("");

  const filteredChats = useMemo(() => {
    const query =
      searchText.trim().toLowerCase();

    if (!query) return chats;

    return chats.filter((chat) =>
      (chat.title || "New Chat")
        .toLowerCase()
        .includes(query)
    );
  }, [chats, searchText]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "12px",
        }}
      >
        <NewChatButton
          onClick={onNewChat}
        />
      </div>

      <div
        style={{
          padding: "0 12px 12px",
        }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(event) =>
            setSearchText(
              event.target.value
            )
          }
          placeholder="Search conversations..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 11px",
            border: "none",
            borderRadius: "8px",
            outline: "none",
            background:
              "rgba(255,255,255,0.75)",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px 12px",
        }}
      >
        {loading && (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
            }}
          >
            Loading conversations...
          </div>
        )}

        {!loading &&
          filteredChats.length === 0 && (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
              }}
            >
              {searchText
                ? "No conversations found"
                : "No conversations yet"}
            </div>
          )}

        {!loading &&
          filteredChats.map((chat) => (
            <ConversationListItem
              key={chat._id}
              chat={chat}
              active={
                chat._id === activeChatId
              }
              onClick={() =>
                onSelectChat(chat._id)
              }
              onDelete={() =>
                onDeleteChat(chat._id)
              }
            />
          ))}
      </div>
    </div>
  );
}