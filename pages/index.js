import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Head from "next/head";

import {
  experimentalEngines as engines,
} from "../model/model.js";

import ChatComponent from "../components/ChatComponent";

import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import UIContext from "../context/UIContext.js";

import Sidebar from "../components/Sidebar/Sidebar.js";

import ChatSettingsControl from "../components/AIManipulatingComponents/AISettingsControl.js";

import Header from "../components/Header/Header.js";

import {
  FlexItem,
} from "../components/Atoms/FlexItem.js";

import OrdinaryButton from "../components/Buttons/OrdinaryButton";

import {
  MdDeleteSweep,
} from "react-icons/md";

import ModeSelector from "../components/AIManipulatingComponents/ModeSelector.js";

import SystemPromptTextArea from "../components/AIManipulatingComponents/SystemPromptTextArea";

import ColorfulButtonSet from "../components/Buttons/ColorfulButtons.js";

import GroupRadioButtons from "../components/Inputs/GroupRadio/GroupRadioButtons.js";

import ActSelector from "../components/AIManipulatingComponents/ActSelector.js";

import ConversationList from "../components/Sidebar/ConversationList";

import useChat from "../hooks/useChat";

export default function MyPage() {
  const {
    asideExpanded,
    setAsideExpand,
  } = useContext(UIContext);

  const {
    chats,
    activeChat,
    activeChatId,

    chatHistory,

    isLoadingChats,
    isLoadingConversation,
    // isLoading,
    createChat,
    selectChat,
    deleteChat,
    clearChat,

    updateActiveChatSettings,
  } = useContext(ChatContext);

  const {
    AIstate,
    activeEngine,
    setActiveEngine,
    setAIState
  } = useContext(AIContext);

  // const [
  //   activeEngine,
  //   setActiveEngine,
  // ] = useState(
  //   engines.find(
  //     (engine) => engine.id === 0
  //   ) || engines[0]
  // );

  const [
    systemPrompt,
    setSystemPrompt,
  ] = useState("");

  const initialized =
    useRef(false);

  /*
   * Keep system prompt synchronized
   * with selected conversation.
   */
  useEffect(() => {
    if (!activeChat) {
      return;
    }

    const settings =
      activeChat.settings || {};

    setSystemPrompt(
      settings.systemPrompt || ""
    );

    setAIState({
      temperature:
        settings.temperature ??
        AIstate.temperature,

      top_p:
        settings.top_p ??
        AIstate.top_p,

      top_k:
        settings.top_k ??
        AIstate.top_k,

      frequency_penalty:
        settings.frequency_penalty ??
        AIstate.frequency_penalty,

      presence_penalty:
        settings.presence_penalty ??
        AIstate.presence_penalty,

      max_response_tokens:
        settings.max_response_tokens ??
        AIstate.max_response_tokens,
    });

    /*
     * Restore engine if it exists.
     */
    const storedEngine =
      engines.find(
        (engine) =>
          engine.key ===
          activeChat.startingEngine
      );

    if (storedEngine) {
      setActiveEngine(
        storedEngine
      );
    }
  }, [activeChat?._id]);

  /*
   * Initial application startup.
   */
  useEffect(() => {
    if (
      initialized.current ||
      isLoadingChats
    ) {
      return;
    }

    if (chats.length > 0) {
      initialized.current =
        true;

      selectChat(
        chats[0]._id
      );

      return;
    }

    /*
     * No conversation exists.
     * Create the first one.
     */
    initialized.current =
      true;

    createChat({
      engine:
        activeEngine.key,

      settings: {
        systemPrompt,
        ...AIstate,
      },
    }).catch((error) => {
      console.error(
        "Initial chat creation:",
        error
      );

      initialized.current =
        false;
    });
  }, [
    isLoadingChats,
    chats.length,
  ]);

  /*
   * AI communication.
   */
  const {
    stream,
    sendMessage,
  } = useChat({
    activeEngine,
    systemPrompt,
  });

  /*
   * Send message.
   */
  const handleSubmit =
    async (content) => {
      await sendMessage(
        content
      );
    };

  /*
   * New conversation.
   */
  const handleNewChat = async () => {
    if (!activeEngine?.key) {
      console.error("No active engine selected");
      return;
    }

    await createChat(activeEngine.key, {
      systemPrompt: AIstate.systemPrompt ?? "",
      max_response_tokens:
        AIstate.max_response_tokens ??
        activeEngine.max_response_tokens ??
        2048,
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
        AIstate.frequency_penalty ?? 0,
      presence_penalty:
        AIstate.presence_penalty ?? 0,
      mode: AIstate.mode ?? "",
      act: AIstate.act ?? "",
    });
  };

  /*
   * Change engine.
   */
  const handleEngineChange =
    async (engineKey) => {
      const engine =
        engines.find(
          (item) =>
            item.key ===
            engineKey
        );

      if (!engine) {
        return;
      }

      setActiveEngine(engine);

      if (activeChatId) {
        /*
         * The next message will use this engine.
         * Persisting the setting can be added here.
         */
      }
    };

  /*
   * System prompt change.
   */
  const handleSystemPromptChange =
    (value) => {
      setSystemPrompt(value);

      updateActiveChatSettings({
        systemPrompt:
          value,
      });
    };

  return (
    <div>
      <Head>
        <title>
          MyGPT3.5
        </title>
      </Head>

      <Sidebar
        show={asideExpanded}
      >
        <ConversationList
          chats={chats}
          activeChatId={
            activeChatId
          }
          loading={
            isLoadingChats
          }
          onNewChat={
            handleNewChat
          }
          onSelectChat={
            selectChat
          }
          onDeleteChat={
            deleteChat
          }
        />

        <ColorfulButtonSet
          items={AIstate}
        />

        <ChatSettingsControl />

        <GroupRadioButtons
          items={engines.map(
            (engine) => ({
              text:
                engine.name,

              value:
                engine.key,

              isActive:
                engine.key ===
                activeEngine.key,
            })
          )}
          changeHandler={
            handleEngineChange
          }
        />

        <ModeSelector
          handleChange={
            handleSystemPromptChange
          }
        />

        <ActSelector
          onChangeHandler={
            handleSystemPromptChange
          }
        />

        <SystemPromptTextArea
          value={
            systemPrompt
          }
          onChange={(e) =>
            handleSystemPromptChange(
              e.currentTarget.value
            )
          }
        />
      </Sidebar>

      <Header>
        <FlexItem width={50}>
          <OrdinaryButton
            text=""
            icon={
              <MdDeleteSweep
                size="20"
                color="#ef3c39"
              />
            }
            handleOnClick={() =>
              clearChat()
            }
          />
        </FlexItem>
      </Header>

      <ChatComponent
        stream={stream}
        prompt=""
        handleSendMessage={
          handleSubmit
        }
        handleOnClick={() =>
          setAsideExpand(false)
        }
        chatHistory={
          chatHistory
        }
        isLoading={
          isLoadingChats ||
          isLoadingConversation
        }
      />
    </div>
  );
}