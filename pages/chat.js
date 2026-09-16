import { useState, useContext } from "react";
import UIContext from "../context/UIContext.js";
import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import ChatComponent from "../components/ChatComponent.js";
import { experimentalEngines as engines } from "../model/model.js";
import Header from "../components/Header/Header.js";
import { FlexItem } from "../components/Atoms/FlexItem.js";
import { stripHTML } from "../utils/stringUtils";
import Sidebar from "../components/Sidebar/Sidebar.js";
import ChatSettingsControl from "../components/AI/ChatSettingsControl";
//import ColorBoxSelector from "../components/ColorBoxSelector/ColorBoxSelector.js";
export default function MyPage() {
  const [prompt, setPrompt] = useState("");

  const { asideExpanded, setAsideExpand } = useContext(UIContext);

  const { chatHistory, addToHistory, isLoading, setIsLoading } =
    useContext(ChatContext);

  const { AIstate } = useContext(AIContext);
  const [activeEngine, setActiveEngine] = useState(engines[0]);
  async function handleSubmit(e) {
    const prompt_timestamp = new Date();
    setIsLoading(true);
    let messages = [];

    chatHistory.forEach((h) => {
      messages.push({ role: "user", content: h.prompt });
      messages.push({ role: "assistant", content: h.completion });
    });
    messages.push({ role: "user", content: prompt });

    let options = {
      engine: activeEngine.key,
      messages: messages,
      ...AIstate,
    };
    // console.log(options);
    try {
      const response = await fetch("/api/openai/get-chat", {
        method: "POST",
        //timeout: 120000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });
      const data = await response.json();
      // console.log(data);
      let completion_timestamp = new Date();

      addToHistory({
        chatId: data.id,
        prompt: prompt,
        prompt_timestamp: prompt_timestamp,
        completion: data.text.trim(),
        completion_timestamp: completion_timestamp, //data.created,
        engine: activeEngine.key,
        // prompt_tokens: data.usage.prompt_tokens,
        // completion_tokens: data.usage.completion_tokens,
        // prompt_price: (
        //   (data.usage.prompt_tokens / 1000) *
        //   activeEngine.costPerKiloToken
        // ).toFixed(5),
        // completion_price: (
        //   (data.usage.completion_tokens / 1000) *
        //   activeEngine.costPerKiloToken
        // ).toFixed(5),
      });

      // console.log(chatHistory);
      setPrompt("");
    } catch {
      (error) => console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptChange(e) {
    let trimPrompt = stripHTML(e.trim());
    if (trimPrompt.length > 0) {
      setPrompt(trimPrompt);
    }
  }

  return (
    <div>
      <Sidebar show={asideExpanded}>
        <ChatSettingsControl aiType='new' />
        {/* <ColorBoxSelector></ColorBoxSelector> */}
      </Sidebar>
      <Header>
        <FlexItem>
          <select
            onChange={(e) => {
              let engineType = e.currentTarget.value;
              setActiveEngine(engines.find((eng) => eng.key === engineType));
            }}>
            {engines.map((eng) => (
              <option key={eng.id} value={eng.key}>
                {eng.name}
              </option>
            ))}
          </select>
        </FlexItem>
      </Header>

      <ChatComponent
        stream={""}
        handleSendMessage={handleSubmit}
        handlePromptTextChange={handlePromptChange}
        handleOnClick={() => {
          if (asideExpanded) setAsideExpand(false);
        }}
      />
    </div>
  );
}
