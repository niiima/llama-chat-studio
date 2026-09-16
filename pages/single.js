import { useState, useContext } from "react";
import Head from "next/head";
import { experimentalEngines as engines } from "../model/model.js";
import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import ChatComponent from "../components/ChatComponent";
import Sidebar from "../components/Sidebar/Sidebar.js";
import ChatSettingsControl from "../components/AI/ChatSettingsControl.js";
import Header from "../components/Header/Header.js";
import UIContext from "../context/UIContext.js";
import { FlexItem } from "../components/Atoms/FlexItem.js";
import { v4 as uuidv4 } from "uuid";
import GroupRadioButtons from "../components/Inputs/GroupRadio/GroupRadioButtons.js";
import OrdinaryButton from "../components/Buttons/OrdinaryButton";
import { MdDeleteSweep } from "react-icons/md";
// import { GiStopSign } from "react-icons/gi";
import ColorfulButtonSet from "../components/Buttons/ColorfulButtons.js";
// const StopGeneratePromptButton = styled(OrdinaryButton)`
//   /* color: red; */
// `;

export default function MyPage() {
  const { asideExpanded, setAsideExpand } = useContext(UIContext);

  const {
    //chatHistory,
    addToHistory,
    //isLoading,
    setIsLoading,
    clearChatHistory,
  } = useContext(ChatContext);

  const { AIstate, setAIState } = useContext(AIContext);
  const [activeEngine, setActiveEngine] = useState(engines[0]);

  const [prompt, setPrompt] = useState("");
  // const [systemPrompt, setSystemPrompt] = useState(
  //   `Assist user for what they might ask, get involve in the conversation and try to provide accurate answers for their questions.`
  // );
  const [stream, setStream] = useState("");

  async function handleSubmit(e) {
    const streamTextArray = [];
    const prompt_timestamp = new Date();
    setIsLoading(true);

    try {
      const messages = [{ role: "system", content: prompt }];

      let options = {
        engine: activeEngine.key,
        messages: messages,
        ...AIstate,
      };

      const response = await fetch("/api/generate-chat-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = response.body;
      if (!data) {
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
        prompt: prompt,
        prompt_timestamp: prompt_timestamp,
        completion: streamTextArray.join(""),
        completion_timestamp: completion_timestamp,
        engine: activeEngine.key,
      });
      setStream("");
      setPrompt("");
    } catch {
      (error) => console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptChange(e) {
    let trimPrompt = e.trim();
    if (trimPrompt.length > 0) {
      setPrompt(trimPrompt);
    }
  }

  return (
    <div>
      <Head>
        <title>GPT only knows your last question</title>
      </Head>
      <Sidebar show={asideExpanded}>
        <ColorfulButtonSet items={AIstate}></ColorfulButtonSet>
        <ChatSettingsControl aiType='new' />
        {/* <EngineSelector
          engines={engines}
          changeEngineHandler={(e) => {
            let engineType = e.currentTarget.value;
            setActiveEngine(engines.find((eng) => eng.key === engineType));
          }}></EngineSelector> */}
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
      </Sidebar>
      <Header>
        <FlexItem width={50}>
          <OrdinaryButton
            text={""}
            icon={<MdDeleteSweep size='20' color='orange' />}
            handleOnClick={() => clearChatHistory()}></OrdinaryButton>
          {/* <StopGeneratePromptButton
            text={""}
            icon={<GiStopSign size='30' />}
            handleOnClick={() => clearChatHistory()}
          /> */}
        </FlexItem>
      </Header>
      <ChatComponent
        stream={stream}
        prompt={prompt}
        handleSendMessage={handleSubmit}
        handlePromptTextChange={handlePromptChange}
        handleOnClick={() => setAsideExpand(false)}
      />
    </div>
  );
}

