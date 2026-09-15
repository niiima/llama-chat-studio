import { createContext, useState } from "react";

import {
  AISettings,
  experimentalEngines,
} from "../model/model";

const AIContext = createContext({});

export function AIProvider({ children }) {
  const [activeEngine, setActiveEngine] = useState(
    experimentalEngines.find((engine) => engine.id === 0) ||
      experimentalEngines[0]
  );

  const [AIstate, setState] = useState({
    ...AISettings,
  });

  const [activeRoute, setActiveRoute] = useState(0);

  const setAIState = (newState) => {
    setState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const changeEngine = (engine) => {
    setActiveEngine(engine);

    /*
     * Reset the AI settings to the new engine's defaults.
     */

    setState((prev) => ({
      ...prev,

      max_tokens:
        engine.maxTokens ??
        AISettings.max_tokens ??
        8192,

      max_response_tokens:
        engine.max_response_tokens ??
        AISettings.max_response_tokens ??
        2048,

      temperature:
        engine.temperature ??
        AISettings.temperature ??
        0.6,

      top_p:
        engine.top_p ??
        AISettings.top_p ??
        0.95,

      top_k:
        engine.top_k ??
        AISettings.top_k ??
        40,

      frequency_penalty:
        engine.frequency_penalty ??
        AISettings.frequency_penalty ??
        0,

      presence_penalty:
        engine.presence_penalty ??
        AISettings.presence_penalty ??
        0,
    }));
  };

  return (
    <AIContext.Provider
      value={{
        AIstate,
        setAIState,

        activeEngine,
        setActiveEngine,
        changeEngine,

        activeRoute,
        setActiveRoute,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export default AIContext;