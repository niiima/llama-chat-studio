import { useState, useContext, useRef, useEffect } from "react";
import Head from "next/head";
import { engines } from "../model/model.js";
import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import ChatSettingsControl from "../components/AI/ChatSettingsControl.js";
import Header from "../components/Header/Header.js";
import UIContext from "../context/UIContext.js";
// import { v4 as uuidv4 } from "uuid";
import ColorfulButtonSet from "../components/Buttons/ColorfulButtons.js";
import GroupRadioButtons from "../components/Inputs/GroupRadio/GroupRadioButtons.js";
//import EngineSelector from "../components/AI/EngineSelector.js";
// import RangeField from "../components/controls/RangeField.js";
import { Box } from "../components/Atoms/Box.js";
import OrdinaryButton from "../components/Buttons/OrdinaryButton.js";
import ResponsiveTable from "../components/Lists/ResponsiveTable.js";
import { MdOutlineFileDownload } from "react-icons/md";

export default function MyPage() {
  const { asideExpanded, setAsideExpand } = useContext(UIContext);

  const { chatHistory, addToHistory, isLoading, setIsLoading } =
    useContext(ChatContext);

  const { AIstate, setAIState } = useContext(AIContext);

  const [activeEngine, setActiveEngine] = useState(engines[0]);
  const [models, setModels] = useState([]);

  async function getModels() {
    const response = await fetch("/api/openai/get-gpt-models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(options),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();
    //console.log(res);
    if (!res.data) {
      return;
    } else setModels(res.data);
  }

  // useEffect(() => getModels(), []);
  return (
    <div>
      <Head>
        <title>GPT 3 Models are super fast</title>
      </Head>
      <Sidebar show={asideExpanded}>
        <ChatSettingsControl aiType='classic' />
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
        <ColorfulButtonSet items={AIstate}></ColorfulButtonSet>
      </Sidebar>
      <Header></Header>
      <Box>
        <OrdinaryButton
          text={"get models"}
          handleOnClick={() => getModels()}
          icon={
            <MdOutlineFileDownload size={20} color={"lightskyblue"} />
          }></OrdinaryButton>
        {models.length > 0 && <ResponsiveTable data={models}></ResponsiveTable>}
      </Box>
    </div>
  );
}
