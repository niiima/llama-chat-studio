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
    // console.log(e);
    const streamTextArray = [];
    const prompt_timestamp = new Date();
    const streamArray = [];
    setIsLoading(true);
    const messages = [];

    const tokenRange =
      AIstate.max_tokens - AIstate.max_response_tokens < activeEngine.maxTokens
        ? AIstate.max_tokens - AIstate.max_response_tokens
        : 4096;

    let previousMessagesToken = 0;
    const chatLength = chatHistory.length - 1;
    try {
      for (let i = chatLength; i >= 0; i--) {
        const { prompt, completion } = chatHistory[i];
        let dialogTokens = encode(prompt).length + encode(completion).length;
        console.log(
          `tokenRange: ${tokenRange} |
           dialogTokens: ${dialogTokens} | messageTokens: ${previousMessagesToken}`
        );
        if (
          previousMessagesToken +
            systemPrompt.length +
            dialogTokens +
            e.length <=
          tokenRange
        ) {
          messages.push({ role: "user", content: prompt });
          messages.push({ role: "assistant", content: completion });
          previousMessagesToken += dialogTokens;
        } else {
          // console.log("breaking");
          break;
        }
      }

      const dialogs = [];

      if (systemPrompt.length > 0)
        dialogs.push({ role: "system", content: systemPrompt });

      messages.forEach((message) => dialogs.push(message));

      dialogs.push({ role: "user", content: e });
      // console.log(dialogs);
      const options = {
        model: activeEngine.key,                    // ← use "model" (OpenAI style)
        messages: dialogs,

        // Sampling parameters
        temperature: AIstate.temperature ?? activeEngine.temperature ?? 0.6,
        top_p: AIstate.top_p ?? activeEngine.top_p ?? 0.95,
        top_k: AIstate.top_k ?? activeEngine.top_k ?? 40,
        frequency_penalty: AIstate.frequency_penalty ?? 0,
        presence_penalty: AIstate.presence_penalty ?? 0,

        // Important: this controls how long the reply can be
        max_tokens: AIstate.max_response_tokens ?? 2048,
      };
       console.log(options);
      const response = await fetch("/api/generate-chat-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      }).catch((error) => console.log(error));
      if (!response.ok) {
        setIsLoading(false);
        try {
          throw new Error(response.statusText);
          // return;
        } catch {
          (error) => console.log(error);
          console.log(response?.statusText);
        }
      }

      const data = response.body;
      // console.log(data);
      if (!data) {
        console.log("No Data");
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let init = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        if (init === false) {
          init = true;
          const substr = chunkValue.slice(9); // remove assistant from the beginning of conversation
          setStream((prev) => prev + substr);
          streamTextArray.push(substr);
        } else {
          setStream((prev) => prev + chunkValue);
          streamTextArray.push(chunkValue);
        }
      }

      const completion_timestamp = new Date();
      const completion = streamTextArray.join("");

      addToHistory({
        chatId: uuidv4(),
        prompt: e,
        prompt_timestamp: prompt_timestamp,
        completion: completion,
        completion_timestamp: completion_timestamp,
        engine: activeEngine.key,
        showMarkdown: false,
      });
       console.log(chatHistory);
      setStream("");
      // if (initialGreets === "done")
      setPrompt("");
    } catch {
      (error) => console.log(error);
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
