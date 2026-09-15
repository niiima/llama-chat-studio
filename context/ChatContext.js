import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

const ChatContext = createContext({});

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] =
    useState(false);

  const [isMarkdownFormatEnabled, setIsMarkdownFormatEnabled] =
    useState(false);

  /*
   * ==========================================
   * LOAD CHAT LIST
   * ==========================================
   */

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch("/api/chats");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = await response.json();

      setChats(data.chats || []);

      return data.chats || [];
    } catch (error) {
      console.error("Failed to load chats:", error);
      return [];
    }
  }, []);

  /*
   * ==========================================
   * LOAD ONE CHAT
   * ==========================================
   */

  const loadChat = useCallback(async (chatId) => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setIsLoadingConversation(true);

    try {
      const response = await fetch(
        `/api/chats/${chatId}/messages`
      );

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();

      setMessages(data.messages || []);
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );

      setMessages([]);
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  /*
   * ==========================================
   * SELECT CHAT
   * ==========================================
   */

  const selectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      setActiveChatId(chatId);
      setMessages([]);
      setIsMarkdownFormatEnabled(false);

      await loadChat(chatId);
    },
    [loadChat]
  );

  /*
   * ==========================================
   * CREATE CHAT
   * ==========================================
   */

  const createChat = useCallback(async (engine, settings = {}) => {
    if (!engine) {
      console.error("No engine provided");
      return null;
    }

    const startingEngine =
      typeof engine === "string" ? engine : engine.key;

    if (!startingEngine) {
      console.error("Invalid engine:", engine);
      return null;
    }

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startingEngine,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create chat"
        );
      }

      const newChat = data.chat;

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([]);
      setIsMarkdownFormatEnabled(false);

      return newChat;
    } catch (error) {
      console.error("Failed to create chat:", error);
      return null;
    }
  }, []);

  /*
   * ==========================================
   * ADD MESSAGE LOCALLY
   * ==========================================
   */

  const addMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      message,
    ]);
  }, []);

  /*
   * ==========================================
   * SAVE MESSAGE
   * ==========================================
   */

  const saveMessage = useCallback(
    async (message) => {
      if (!activeChatId) {
        throw new Error("No active chat");
      }

      const response = await fetch(
        `/api/chats/${activeChatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
            engine: message.engine,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save message"
        );
      }

      const data = await response.json();

      const savedMessage = data.message;

      setMessages((prev) => [
        ...prev,
        savedMessage,
      ]);

      /*
       * Update the sidebar item.
       */

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChatId
            ? {
                ...chat,
                title:
                  data.chat?.title ||
                  chat.title,
                updatedAt:
                  data.chat?.updatedAt ||
                  new Date().toISOString(),
                messagesCount:
                  data.chat?.messagesCount ??
                  chat.messagesCount,
              }
            : chat
        )
      );

      return savedMessage;
    },
    [activeChatId]
  );

  const updateChatInList = useCallback(
    (updatedChat) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === updatedChat.chatId
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
   * DELETE CHAT
   * ==========================================
   */

  const deleteChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      try {
        const response = await fetch(
          `/api/chats/${chatId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to delete chat"
          );
        }

        setChats((prev) =>
          prev.filter(
            (chat) => chat._id !== chatId
          )
        );

        if (activeChatId === chatId) {
          setActiveChatId(null);
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

  //--------
  const updateActiveChatSettings = useCallback(
    async (settings) => {
      if (!activeChatId) {
        console.error("No active chat");
        return null;
      }

      try {
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update chat settings"
          );
        }

        const updatedChat = data.chat;

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === activeChatId
              ? {
                  ...chat,
                  ...updatedChat,
                }
              : chat
          )
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
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const loadedChats = await loadChats();

      if (cancelled) return;

      if (loadedChats.length > 0) {
        /*
         * Select the most recently updated chat.
         */

        const firstChat = loadedChats[0];

        setActiveChatId(firstChat._id);

        await loadChat(firstChat._id);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [loadChats, loadChat]);

  /*
   * ==========================================
   * PROVIDER
   * ==========================================
   */

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        messages,

        isLoading,
        setIsLoading,

        isLoadingConversation,

        createChat,
        selectChat,
        loadChat,
        loadChats,
        deleteChat,
        updateChatInList,
        updateActiveChatSettings,
        
        addMessage,
        saveMessage,

        isMarkdownFormatEnabled,
        setIsMarkdownFormatEnabled,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContext;