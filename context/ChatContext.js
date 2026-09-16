import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Global UI preference.
   *
   * This is intentionally NOT part of ChatContext.
   * Markdown is a UI preference, not conversation data.
   */
  const [isMarkdownFormatEnabled, setIsMarkdownFormatEnabled] =
    useState(false);

  // ==========================================
  // LOAD ALL CHATS
  // ==========================================

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);

    try {
      const response = await fetch("/api/chats");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = await response.json();

      const loadedChats = data.chats || [];

      setChats(loadedChats);

      return loadedChats;
    } catch (error) {
      console.error("loadChats:", error);
      throw error;
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // ==========================================
  // LOAD ONE CHAT
  // ==========================================

  const loadChat = useCallback(async (chatId) => {
    if (!chatId) return null;

    setIsLoadingConversation(true);

    try {
      const response = await fetch(
        `/api/chats/${chatId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();

      const chat = data.chat;

      setActiveChatId(chat._id);
      setActiveChat(chat);
      setMessages(chat.messages || []);

      return chat;
    } catch (error) {
      console.error("loadChat:", error);
      throw error;
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  // ==========================================
  // SELECT CHAT
  // ==========================================

  const selectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      // Avoid unnecessary reload.
      if (chatId === activeChatId && activeChat) {
        return activeChat;
      }

      // Immediately clear the old conversation from the UI.
      setMessages([]);
      setActiveChat(null);
      setActiveChatId(chatId);

      return loadChat(chatId);
    },
    [activeChatId, activeChat, loadChat]
  );

  // ==========================================
  // CREATE CHAT
  // ==========================================

  const createChat = useCallback(
    async (engine, settings = {}) => {
      const currentEngine =
        typeof engine === "string"
          ? engine
          : engine?.key;

      if (!currentEngine) {
        throw new Error(
          "An engine is required to create a chat"
        );
      }

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentEngine,
          settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "Failed to create chat"
        );
      }

      const data = await response.json();
      const chat = data.chat;

      // Newest conversation goes first.
      setChats((previous) => [
        chat,
        ...previous.filter(
          (item) => item._id !== chat._id
        ),
      ]);

      setActiveChatId(chat._id);
      setActiveChat(chat);
      setMessages([]);

      return chat;
    },
    []
  );

  // ==========================================
  // DELETE CHAT
  // ==========================================

  const deleteChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      const response = await fetch(
        `/api/chats/${chatId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "Failed to delete chat"
        );
      }

      /*
       * Remove it from the sidebar.
       */
      setChats((previous) =>
        previous.filter(
          (chat) => chat._id !== chatId
        )
      );

      /*
       * If we deleted the active conversation,
       * select another one.
       */
      if (chatId === activeChatId) {
        const remainingChats = chats.filter(
          (chat) => chat._id !== chatId
        );

        if (remainingChats.length > 0) {
          await loadChat(remainingChats[0]._id);
        } else {
          setActiveChatId(null);
          setActiveChat(null);
          setMessages([]);
        }
      }

      return true;
    },
    [activeChatId, chats, loadChat]
  );

  // ==========================================
  // ADD MESSAGE LOCALLY
  // ==========================================

  const addMessage = useCallback((message) => {
    if (!message) return;

    setMessages((previous) => [
      ...previous,
      message,
    ]);
  }, []);

  // ==========================================
  // SAVE MESSAGE
  // ==========================================

  const saveMessage = useCallback(
    async ({
      role,
      content,
      timestamp,
      engine,
    }) => {
      if (!activeChatId) {
        throw new Error("No active chat");
      }

      const body = {
        role,
        content,
        timestamp:
          timestamp || new Date().toISOString(),
      };

      /*
       * Engine is only sent for assistant messages.
       */
      if (role === "assistant") {
        body.engine = engine;
      }

      const response = await fetch(
        `/api/chats/${activeChatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "Failed to save message"
        );
      }

      const data = await response.json();

      if (data.message) {
        setMessages((previous) => [
          ...previous,
          data.message,
        ]);
      }

      /*
       * The API may have changed the title after the
       * first user message.
       */
      if (data.chat) {
        setChats((previous) =>
          previous.map((chat) =>
            chat._id === activeChatId
              ? {
                  ...chat,
                  ...data.chat,
                }
              : chat
          )
        );

        setActiveChat((previous) =>
          previous
            ? {
                ...previous,
                ...data.chat,
              }
            : previous
        );
      }

      return data;
    },
    [activeChatId]
  );

  // ==========================================
  // UPDATE CHAT IN SIDEBAR
  // ==========================================

  const updateChatInList = useCallback(
    (chatUpdate) => {
      if (!chatUpdate?._id) return;

      setChats((previous) =>
        previous.map((chat) =>
          chat._id === chatUpdate._id
            ? {
                ...chat,
                ...chatUpdate,
              }
            : chat
        )
      );
    },
    []
  );

  // ==========================================
  // UPDATE ACTIVE CHAT SETTINGS
  // ==========================================

  const updateActiveChatSettings = useCallback(
    async (settings) => {
      if (!activeChatId) return;

      const response = await fetch(
        `/api/chats/${activeChatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message ||
            "Failed to update chat settings"
        );
      }

      const data = await response.json();

      if (data.chat) {
        setActiveChat(data.chat);

        updateChatInList({
          _id: data.chat._id,
          title: data.chat.title,
          currentEngine: data.chat.currentEngine,
          updatedAt: data.chat.updatedAt,
        });
      }

      return data.chat;
    },
    [activeChatId, updateChatInList]
  );

  // ==========================================
  // UPDATE CURRENT ENGINE
  // ==========================================

  const updateCurrentEngine = useCallback(
    async (engine) => {
      if (!activeChatId) return;

      const currentEngine =
        typeof engine === "string"
          ? engine
          : engine?.key;

      if (!currentEngine) {
        throw new Error("Engine is required");
      }

      const response = await fetch(
        `/api/chats/${activeChatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentEngine,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message ||
            "Failed to update current engine"
        );
      }

      const data = await response.json();

      if (data.chat) {
        setActiveChat(data.chat);

        updateChatInList({
          _id: data.chat._id,
          currentEngine: data.chat.currentEngine,
          updatedAt: data.chat.updatedAt,
        });
      }

      return data.chat;
    },
    [activeChatId, updateChatInList]
  );

  // ==========================================
  // UPDATE TITLE
  // ==========================================

  const updateChatTitle = useCallback(
    async (title) => {
      if (!activeChatId) return;

      const response = await fetch(
        `/api/chats/${activeChatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message ||
            "Failed to update chat title"
        );
      }

      const data = await response.json();

      if (data.chat) {
        setActiveChat(data.chat);

        updateChatInList({
          _id: data.chat._id,
          title: data.chat.title,
          updatedAt: data.chat.updatedAt,
        });
      }

      return data.chat;
    },
    [activeChatId, updateChatInList]
  );

  // ==========================================
  // CLEAR UI
  // ==========================================

  /*
   * This intentionally does NOT delete messages
   * from MongoDB.
   *
   * It only clears the local UI.
   */
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadChats().catch((error) => {
      console.error(
        "Initial chat loading:",
        error
      );
    });
  }, [loadChats]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = useMemo(
    () => ({
      chats,
      activeChatId,
      activeChat,
      messages,

      isLoading,
      setIsLoading,

      isLoadingChats,
      isLoadingConversation,

      loadChats,
      loadChat,
      selectChat,
      createChat,
      deleteChat,

      addMessage,
      saveMessage,

      updateChatInList,
      updateActiveChatSettings,
      updateCurrentEngine,
      updateChatTitle,

      clearChat,

      isMarkdownFormatEnabled,
      setIsMarkdownFormatEnabled,

      /*
       * Compatibility with the old application.
       */
      chatHistory: messages,
    }),
    [
      chats,
      activeChatId,
      activeChat,
      messages,
      isLoading,
      isLoadingChats,
      isLoadingConversation,
      loadChats,
      loadChat,
      selectChat,
      createChat,
      deleteChat,
      addMessage,
      saveMessage,
      updateChatInList,
      updateActiveChatSettings,
      updateCurrentEngine,
      updateChatTitle,
      clearChat,
      isMarkdownFormatEnabled,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContext;