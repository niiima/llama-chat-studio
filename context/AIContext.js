import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

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

  /**
   * Update AI settings without replacing the whole state.
   *
   * Supports both:
   *   setAIState({ temperature: 0.7 })
   *
   * and:
   *   setAIState((previous) => ({ ...previous, ... }))
   */
  const setAIState = useCallback((newState) => {
    setState((previous) => {
      const patch =
        typeof newState === "function"
          ? newState(previous)
          : newState;

      return {
        ...previous,
        ...patch,
      };
    });
  }, []);

  /**
   * Change the active model and reset generation
   * parameters to that model's defaults.
   */
  const changeEngine = useCallback((engine) => {
    if (!engine) return;

    setActiveEngine(engine);

    setState((previous) => ({
      ...previous,

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
  }, []);

  const contextValue = useMemo(
    () => ({
      AIstate,
      setAIState,
      activeEngine,
      setActiveEngine,
      changeEngine,
      activeRoute,
      setActiveRoute,
    }),
    [
      AIstate,
      setAIState,
      activeEngine,
      changeEngine,
      activeRoute,
    ]
  );

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

export default AIContext;