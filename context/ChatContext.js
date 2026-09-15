import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

const ChatContext = createContext({});

export function ChatProvider({ children }) {
  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  // Lightweight chat list for the sidebar.
  const [chats, setChats] = useState([]);

  // MongoDB _id of the active conversation.
  const [activeChatId, setActiveChatId] =
    useState(null);

  // Full selected ChatSession.
  const [activeChat, setActiveChat] =
    useState(null);

  // Messages displayed in the active conversation.
  const [messages, setMessages] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isLoadingChats, setIsLoadingChats] =
    useState(true);

  const [
    isLoadingConversation,
    setIsLoadingConversation,
  ] = useState(false);

  const [
    isMarkdownFormatEnabled,
    setIsMarkdownFormatEnabled,
  ] = useState(false);

  /*
   * ==========================================
   * LOAD CHAT LIST
   * ==========================================
   */

  const loadChats = useCallback(
    async () => {
      setIsLoadingChats(true);

      try {
        const response =
          await fetch("/api/chats");

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load chats"
          );
        }

        const loadedChats =
          data.chats || [];

        setChats(loadedChats);

        return loadedChats;
      } catch (error) {
        console.error(
          "Failed to load chats:",
          error
        );

        setChats([]);

        return [];
      } finally {
        setIsLoadingChats(false);
      }
    },
    []
  );

  /*
   * ==========================================
   * LOAD ONE CHAT
   * ==========================================
   *
   * GET /api/chats/:chatId
   *
   * The API returns the complete ChatSession,
   * including settings and messages.
   */

  const loadChat = useCallback(
    async (chatId) => {
      if (!chatId) {
        setActiveChat(null);
        setActiveChatId(null);
        setMessages([]);
        return null;
      }

      setIsLoadingConversation(true);

      try {
        const response =
          await fetch(
            `/api/chats/${chatId}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load chat"
          );
        }

        const chat = data.chat;

        if (!chat) {
          throw new Error(
            "Chat data is missing"
          );
        }

        const id =
          chat._id.toString();

        setActiveChatId(id);
        setActiveChat(chat);
        setMessages(
          chat.messages || []
        );

        return chat;
      } catch (error) {
        console.error(
          "Failed to load chat:",
          error
        );

        setActiveChat(null);
        setActiveChatId(null);
        setMessages([]);

        return null;
      } finally {
        setIsLoadingConversation(false);
      }
    },
    []
  );

  /*
   * ==========================================
   * SELECT CHAT
   * ==========================================
   */

  const selectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      setMessages([]);
      setActiveChat(null);
      setIsMarkdownFormatEnabled(false);

      return loadChat(chatId);
    },
    [loadChat]
  );

  /*
   * ==========================================
   * CREATE CHAT
   * ==========================================
   *
   * POST /api/chats
   */

  const createChat = useCallback(
    async (
      engine,
      settings = {}
    ) => {
      if (!engine) {
        console.error(
          "No engine provided"
        );
        return null;
      }

      const startingEngine =
        typeof engine === "string"
          ? engine
          : engine?.key;

      if (!startingEngine) {
        console.error(
          "Invalid engine:",
          engine
        );
        return null;
      }

      try {
        const response =
          await fetch("/api/chats", {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              startingEngine,
              settings,
            }),
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to create chat"
          );
        }

        const newChat =
          data.chat;

        /*
         * New chat becomes active immediately.
         */
        setChats((prev) => [
          newChat,
          ...prev,
        ]);

        setActiveChatId(
          newChat._id
        );

        setActiveChat(newChat);

        setMessages([]);

        setIsMarkdownFormatEnabled(
          false
        );

        return newChat;
      } catch (error) {
        console.error(
          "Failed to create chat:",
          error
        );

        return null;
      }
    },
    []
  );

  /*
   * ==========================================
   * ADD MESSAGE LOCALLY
   * ==========================================
   */

  const addMessage = useCallback(
    (message) => {
      setMessages((prev) => [
        ...prev,
        message,
      ]);
    },
    []
  );

  /*
   * ==========================================
   * SAVE MESSAGE
   * ==========================================
   *
   * POST /api/chats/:chatId/messages
   */

  const saveMessage = useCallback(
    async (message) => {
      if (!activeChatId) {
        throw new Error(
          "No active chat"
        );
      }

      const response =
        await fetch(
          `/api/chats/${activeChatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              role: message.role,
              content:
                message.content,
              timestamp:
                message.timestamp,
              engine:
                message.engine,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save message"
        );
      }

      const savedMessage =
        data.message;

      setMessages((prev) => [
        ...prev,
        savedMessage,
      ]);

      /*
       * Synchronize sidebar and active chat.
       */
      if (data.chat) {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === activeChatId
              ? {
                  ...chat,
                  title:
                    data.chat.title ??
                    chat.title,
                  updatedAt:
                    data.chat.updatedAt ??
                    chat.updatedAt,
                  messagesCount:
                    data.chat
                      .messagesCount ??
                    chat.messagesCount,
                }
              : chat
          )
        );

        setActiveChat((prev) =>
          prev
            ? {
                ...prev,
                title:
                  data.chat.title ??
                  prev.title,
                updatedAt:
                  data.chat.updatedAt ??
                  prev.updatedAt,
                messages: [
                  ...(prev.messages ||
                    []),
                  savedMessage,
                ],
              }
            : prev
        );
      }

      return savedMessage;
    },
    [activeChatId]
  );

  /*
   * ==========================================
   * UPDATE SIDEBAR CHAT
   * ==========================================
   */

  const updateChatInList =
    useCallback(
      (updatedChat) => {
        if (!updatedChat) return;

        const id =
          updatedChat._id ??
          updatedChat.chatId;

        if (!id) return;

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === id
              ? {
                  ...chat,
                  title:
                    updatedChat.title ??
                    chat.title,
                  updatedAt:
                    updatedChat.updatedAt ??
                    chat.updatedAt,
                  messagesCount:
                    updatedChat.messagesCount ??
                    chat.messagesCount,
                }
              : chat
          )
        );
      },
      []
    );

  /*
   * ==========================================
   * UPDATE ACTIVE CHAT SETTINGS
   * ==========================================
   *
   * PATCH /api/chats/:chatId
   */

  const updateActiveChatSettings =
    useCallback(
      async (settings) => {
        if (!activeChatId) {
          console.error(
            "No active chat"
          );
          return null;
        }

        try {
          const response =
            await fetch(
              `/api/chats/${activeChatId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  settings,
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to update chat settings"
            );
          }

          const updatedChat =
            data.chat;

          /*
           * Update sidebar copy.
           */
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === activeChatId
                ? {
                    ...chat,
                    title:
                      updatedChat.title ??
                      chat.title,
                    updatedAt:
                      updatedChat.updatedAt ??
                      chat.updatedAt,
                  }
                : chat
            )
          );

          /*
           * Update full active chat.
           */
          setActiveChat((prev) =>
            prev
              ? {
                  ...prev,
                  ...updatedChat,
                }
              : updatedChat
          );

          return updatedChat;
        } catch (error) {
          console.error(
            "Failed to update active chat settings:",
            error
          );

          return null;
        }
      },
      [activeChatId]
    );

  /*
   * ==========================================
   * DELETE CHAT
   * ==========================================
   */

  const deleteChat =
    useCallback(
      async (chatId) => {
        if (!chatId) return false;

        try {
          const response =
            await fetch(
              `/api/chats/${chatId}`,
              {
                method: "DELETE",
              }
            );

          const data =
            await response
              .json()
              .catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to delete chat"
            );
          }

          setChats((prev) =>
            prev.filter(
              (chat) =>
                chat._id !== chatId
            )
          );

          if (
            activeChatId === chatId
          ) {
            setActiveChatId(null);
            setActiveChat(null);
            setMessages([]);
          }

          return true;
        } catch (error) {
          console.error(
            "Failed to delete chat:",
            error
          );

          return false;
        }
      },
      [activeChatId]
    );

  /*
   * ==========================================
   * CLEAR CURRENT CHAT DISPLAY
   * ==========================================
   *
   * This does NOT delete the database chat.
   */

  const clearChat =
    useCallback(() => {
      setMessages([]);
    }, []);

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const initialize =
      async () => {
        const loadedChats =
          await loadChats();

        if (cancelled) return;

        if (
          loadedChats.length > 0
        ) {
          /*
           * /api/chats is sorted by
           * updatedAt descending.
           */
          await selectChat(
            loadedChats[0]._id
          );
        }
      };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [loadChats, selectChat]);

  /*
   * ==========================================
   * PROVIDER
   * ==========================================
   */

  return (
    <ChatContext.Provider
      value={{
        chats,

        activeChat,
        activeChatId,

        messages,

        // Backwards compatibility
        // for ChatComponent.
        chatHistory: messages,

        isLoading,
        setIsLoading,

        isLoadingChats,
        isLoadingConversation,

        createChat,
        selectChat,
        loadChat,
        loadChats,

        deleteChat,
        clearChat,

        addMessage,
        saveMessage,

        updateChatInList,
        updateActiveChatSettings,

        isMarkdownFormatEnabled,
        setIsMarkdownFormatEnabled,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContext;