import {
  useContext,
  useEffect,
  useState,
} from "react";

import Head from "next/head";

import { experimentalEngines as engines } from "../model/model.js";

import ChatComponent from "../components/ChatComponent";

import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import UIContext from "../context/UIContext.js";

import Sidebar from "../components/Sidebar/Sidebar.js";
import ConversationList from "../components/Sidebar/ConversationList.js";

import Header from "../components/Header/Header.js";

import useChat from "../hooks/useChat";

export default function MyPage() {
  const {
    asideExpanded,
  } = useContext(UIContext);

  const {
    chats,
    activeChat,
    activeChatId,

    isLoadingChats,
    isLoadingConversation,

    createChat,
    selectChat,
    deleteChat,

    updateActiveChatSettings,
    updateCurrentEngine,
  } = useContext(ChatContext);

  const {
    AIstate,
    activeEngine,
    setActiveEngine,
    setAIState,
  } = useContext(AIContext);

  const [systemPrompt, setSystemPrompt] =
    useState("");

  // ==========================================
  // LOAD ACTIVE CHAT SETTINGS
  // ==========================================

  useEffect(() => {
    if (!activeChat) return;

    const settings = activeChat.settings || {};

    setSystemPrompt(settings.systemPrompt || "");

    setAIState((previous) => ({
      ...previous,
      temperature:
        settings.temperature ?? previous.temperature,
      top_p:
        settings.top_p ?? previous.top_p,
      top_k:
        settings.top_k ?? previous.top_k,
      frequency_penalty:
        settings.frequency_penalty ??
        previous.frequency_penalty,
      presence_penalty:
        settings.presence_penalty ??
        previous.presence_penalty,
      max_response_tokens:
        settings.max_response_tokens ??
        previous.max_response_tokens,
      mode:
        settings.mode ?? previous.mode,
      act:
        settings.act ?? previous.act,
    }));

    const storedEngine = engines.find(
      (engine) =>
        engine.key === activeChat.currentEngine
    );

    if (storedEngine) {
      setActiveEngine(storedEngine);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    if (isLoadingChats) return;
    if (activeChatId) return;
    if (chats.length === 0) return;

    selectChat(chats[0]._id);
  }, [isLoadingChats, activeChatId, chats.length]);

  // ==========================================
  // CHAT GENERATION
  // ==========================================

  const {
    stream,
    sendMessage,
  } = useChat({
    activeEngine,
    activeChat,
    systemPrompt,
  });

  // ==========================================
  // NEW CHAT
  // ==========================================

  const handleNewChat = async () => {
    if (!activeEngine?.key) {
      console.error(
        "Cannot create chat without an engine"
      );

      return;
    }

    try {
    await createChat(
      activeEngine.key,
      {
        systemPrompt:
          systemPrompt || "",

        temperature:
          AIstate.temperature ??
          activeEngine.temperature ??
          0.6,

        top_p:
          AIstate.top_p ??
          activeEngine.top_p ??
          0.95,

        top_k:
          AIstate.top_k ??
          activeEngine.top_k ??
          40,

        frequency_penalty:
          AIstate.frequency_penalty ??
          0,

        presence_penalty:
          AIstate.presence_penalty ??
          0,

        max_response_tokens:
          AIstate.max_response_tokens ??
          activeEngine.max_response_tokens ??
          2048,

        mode:
          AIstate.mode || "",

        act:
          AIstate.act || "",

        enableThinking: true,
        showReasoning: true,
      }
    );
    } catch (error) {
      console.error(
        "handleNewChat:",
        error
      );
    }
  };

  // ==========================================
  // ENGINE CHANGE
  // ==========================================

  const handleEngineChange = async (
    engineKey
  ) => {
    const engine =
      engines.find(
        (item) =>
          item.key === engineKey
      );

    if (!engine) return;

    /*
     * Update local AI state immediately.
     */
    setActiveEngine(engine);

    /*
     * Persist the selected engine on this
     * conversation.
     *
     * This means the next response uses it.
     */
    if (activeChatId) {
      try {
        await updateCurrentEngine(
          engine.key
        );
      } catch (error) {
        console.error(
          "Failed to update current engine:",
          error
        );
      }
    }
  };

  // ==========================================
  // SYSTEM PROMPT
  // ==========================================

  const handleSystemPromptChange = (
    value
  ) => {
    setSystemPrompt(value);
  };

  const handleSystemPromptBlur = async () => {
    if (!activeChatId) return;

    try {
      await updateActiveChatSettings({
        systemPrompt,
      });
    } catch (error) {
      console.error(
        "Failed to save system prompt:",
        error
      );
    }
  };

  // Reasoning handlers

  const handleThinkingChange = async (value) => {
    console.log(
      ">>> handleThinkingChange called:",
      value
    );

    try {
      const updatedChat =
        await updateActiveChatSettings({
          enableThinking: value,
        });

      // console.log(
      //   ">>> updated chat:",
      //   updatedChat
      // );
    } catch (error) {
      console.error(
        "Failed to update thinking setting:",
        error
      );
    }
  };

  const handleShowReasoningChange = async (value) => {
    // console.log(
    //   ">>> handleShowReasoningChange called:",
    //   value
    // );

    try {
      const updatedChat =
        await updateActiveChatSettings({
          showReasoning: value,
        });


    } catch (error) {
      console.error(
        "Failed to update reasoning visibility:",
        error
      );
    }
  };

  // AI settings 

  const handleModeChange = async (value) => {
    setAIState((previous) => ({
      ...previous,
      mode: value,
    }));

    try {
      await updateActiveChatSettings({
        mode: value,
      });
    } catch (error) {
      console.error(
        "Failed to update mode:",
        error
      );
    }
  };

  const handleActChange = async (value) => {
    setAIState((previous) => ({
      ...previous,
      act: value,
    }));

    try {
      await updateActiveChatSettings({
        act: value,
      });
    } catch (error) {
      console.error(
        "Failed to update act:",
        error
      );
    }
  };

  // ==========================================
  // SEND
  // ==========================================

  const handleSubmit = async (content) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error(
        "Message submission:",
        error
      );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

return (
  <>
    <Head>
      <title>AI Assistant</title>
    </Head>

    <Header />

    <Sidebar show={asideExpanded}>
      <ConversationList
        chats={chats}
        activeChatId={activeChatId}
        loading={isLoadingChats}
        onNewChat={handleNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />
    </Sidebar>

    <main
      style={{
        position: "fixed",

        top: "56px",
        right: 0,
        bottom: 0,

        left: asideExpanded
          ? "300px"
          : "0px",

        transition: "left 0.25s ease",

        display: "flex",
        flexDirection: "column",

        minWidth: 0,
        minHeight: 0,

        overflow: "hidden",

        background: "#0f172a",
      }}
    >
      <ChatComponent
        handleSendMessage={handleSubmit}
        stream={stream}
        prompt=""
        isLoadingConversation={
          isLoadingConversation
        }
        engines={engines}
        activeEngine={activeEngine}
        onEngineChange={
          handleEngineChange
        }
        systemPrompt={systemPrompt}
        onSystemPromptChange={
          setSystemPrompt
        }
        onSystemPromptBlur={
          handleSystemPromptBlur
        }
        mode={AIstate.mode}
        act={AIstate.act}
        onModeChange={handleModeChange}
        onActChange={handleActChange}
        enableThinking={
          activeChat?.settings?.enableThinking ??
          true
        }
        onThinkingChange={
          handleThinkingChange
        }
        onShowReasoningChange={
          handleShowReasoningChange
        }
      />
    </main>
  </>
);
}