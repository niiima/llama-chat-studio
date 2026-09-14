import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { experimentalEngines as engines } from "../model/model.js";
import ChatComponent from "../components/ChatComponent";
import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import ChatSettingsControl from "../components/AIManipulatingComponents/AISettingsControl.js";
import Header from "../components/Header/Header.js";
import UIContext from "../context/UIContext.js";
import { FlexItem } from "../components/Atoms/FlexItem.js";
import { v4 as uuidv4 } from "uuid";
import OrdinaryButton from "../components/Buttons/OrdinaryButton";
import { MdDeleteSweep } from "react-icons/md";
import ModeSelector from "../components/AIManipulatingComponents/ModeSelector.js";
import SystemPromptTextArea from "../components/AIManipulatingComponents/SystemPromptTextArea";
import ColorfulButtonSet from "../components/Buttons/ColorfulButtons.js";
import GroupRadioButtons from "../components/Inputs/GroupRadio/GroupRadioButtons.js";
import ActSelector from "../components/AIManipulatingComponents/ActSelector.js";
import { encode } from "gpt-tokenizer";

export default function MyPage() {
  const { asideExpanded, setAsideExpand } = useContext(UIContext);

  const {
    chatHistory,
    addToHistory,
    isLoading,
    setIsLoading,
    clearChatHistory,
  } = useContext(ChatContext);

  const { AIstate } = useContext(AIContext);
  const [activeEngine, setActiveEngine] = useState(engines.filter(e=>e.id==0)[0]);

  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [stream, setStream] = useState("");
  // const [initialGreets, setInitialGreets] = useState("pending");

const handleSubmit = async (e) => {
  const streamTextArray = [];
  const prompt_timestamp = new Date();
  setIsLoading(true);

  try {
    // ---------- 1. Build clean conversation history ----------
    const maxContext = activeEngine.maxTokens ?? 8192;
    const maxReply = AIstate.max_response_tokens ?? 2048;
    const safetyMargin = 256;
    const availableForHistory = maxContext - maxReply - safetyMargin;

    // Helper: detect garbage (HTML pages, empty, etc.)
    const isGarbage = (text) => {
      if (!text || typeof text !== "string") return true;
      const t = text.trim();
      if (t.length < 2) return true;
      if (t.includes("<html") || t.includes("<!DOCTYPE") || t.includes("scriptLoader")) return true;
      if (t.startsWith("<div style=")) return true;
      return false;
    };

    // Walk history from newest → oldest, keep only clean turns
    const historyMessages = [];
    let usedTokens = 0;

    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const { prompt, completion } = chatHistory[i];

      if (isGarbage(prompt) || isGarbage(completion)) continue;

      const dialogTokens =
        encode(prompt).length + encode(completion).length;

      if (usedTokens + dialogTokens > availableForHistory) break;

      // unshift so final order is oldest → newest
      historyMessages.unshift(
        { role: "user", content: prompt },
        { role: "assistant", content: completion }
      );
      usedTokens += dialogTokens;
    }

    // ---------- 2. Final messages array ----------
    const messages = [];

    if (systemPrompt?.trim()) {
      messages.push({ role: "system", content: systemPrompt.trim() });
    }

    messages.push(...historyMessages);
    messages.push({ role: "user", content: e });

    // ---------- 3. Payload ----------
    const options = {
      model: activeEngine.key,
      messages,
      temperature: AIstate.temperature ?? activeEngine.temperature ?? 0.6,
      top_p: AIstate.top_p ?? activeEngine.top_p ?? 0.95,
      top_k: AIstate.top_k ?? activeEngine.top_k ?? 40,
      frequency_penalty: AIstate.frequency_penalty ?? 0,
      presence_penalty: AIstate.presence_penalty ?? 0,
      max_tokens: AIstate.max_response_tokens ?? 2048,
    };

    console.log("Sending:", options);

    // ---------- 4. Call API (same as before) ----------
    const response = await fetch("/api/generate-chat-completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(response.statusText || "Request failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullCompletion = ""; // Variable to store the entire response

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setStream((prev) => prev + chunkValue);
      streamTextArray.push(chunkValue);
      fullCompletion += chunkValue; // Accumulate full completion for saving
    }

    const completion = fullCompletion.trim();
    const completion_timestamp = new Date();

    // Only save clean completions
    if (completion && !isGarbage(completion)) {
      const newMessageItem = {
        chatId: uuidv4(), // Generate ID here for persistence
        prompt: e,
        prompt_timestamp: prompt_timestamp,
        completion: completion,
        completion_timestamp: completion_timestamp,
        engine: activeEngine.key,
        showMarkdown: false,
      };

      // 1. Update Local State (UI)
      addToHistory(newMessageItem);

      // 2. PERSIST TO MONGODB via new API endpoint
      try {
        await fetch("/api/save-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: newMessageItem.chatId,
            prompt: newMessageItem.prompt,
            completion: newMessageItem.completion,
            engine: newMessageItem.engine,
            prompt_timestamp: newMessageItem.prompt_timestamp,
            completion_timestamp: newMessageItem.completion_timestamp,
          }),
        });
        console.log("Successfully saved chat to MongoDB.");
      } catch (dbError) {
        console.error("Failed to save chat to MongoDB:", dbError);
      }
    }

    setStream("");
    setPrompt("");
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div>
      <Head>
        <title>MyGPT3.5</title>
      </Head>
      <Sidebar show={asideExpanded}>
        <ColorfulButtonSet items={AIstate}></ColorfulButtonSet>
        <ChatSettingsControl />
        <GroupRadioButtons
          items={[
            ...engines.map((engine) => {
              return {
                text: engine.name,
                value: engine.key,
                isActive: engine.key === activeEngine.key,
              };
            }),
          ]}
          changeHandler={(e) =>
            setActiveEngine(engines.find((eng) => eng.key === e))
          }></GroupRadioButtons>
        <ModeSelector
          handleChange={(prompt) => {
            // clearChatHistory();
            setSystemPrompt(prompt);
          }}></ModeSelector>
        <ActSelector
          onChangeHandler={(prompt) => {
            // clearChatHistory();
            setSystemPrompt(prompt);
          }}></ActSelector>
        <SystemPromptTextArea
          value={systemPrompt}
          onChange={(e) =>
            setSystemPrompt(e.currentTarget.value)
          }></SystemPromptTextArea>
        {/* <ColorBoxSelector></ColorBoxSelector> */}
      </Sidebar>
      <Header>
        <FlexItem width={50}>
          <OrdinaryButton
            text={""}
            icon={<MdDeleteSweep size='20' color='#ef3c39' />}
            handleOnClick={() => clearChatHistory()}></OrdinaryButton>
        </FlexItem>
      </Header>
      <ChatComponent
        stream={stream}
        prompt={prompt}
        handleSendMessage={handleSubmit}
        handleOnClick={() => setAsideExpand(false)}
      />
    </div>
  );
}
