import { useContext, useEffect, useRef } from "react";
import { useControls, Leva } from "leva";
import AIContext from "../../context/AIContext";

export default function ChatSettingsControl() {
  const { setAIState, activeEngine } = useContext(AIContext);

  // Keep track of the previous engine so we only reset when it actually changes
  const prevEngineKey = useRef(activeEngine?.key);

  const defaults = {
    max_tokens: activeEngine?.maxTokens ?? 8192,
    max_response_tokens: activeEngine?.max_response_tokens ?? 2048,
    temperature: activeEngine?.temperature ?? 0.6,
    top_p: activeEngine?.top_p ?? 0.95,
    top_k: activeEngine?.top_k ?? 40,
    frequency_penalty: activeEngine?.frequency_penalty ?? 0,
    presence_penalty: activeEngine?.presence_penalty ?? 0,
  };

  const [values, set] = useControls(
    () => ({
      max_tokens: {
        value: defaults.max_tokens,
        min: 512,
        max: activeEngine?.maxTokens ?? 16384,
        step: 64,
      },
      max_response_tokens: {
        value: defaults.max_response_tokens,
        min: 128,
        max: 8192,
        step: 64,
      },
      temperature: {
        value: defaults.temperature,
        min: 0,
        max: 2,
        step: 0.01,
      },
      top_p: {
        value: defaults.top_p,
        min: 0,
        max: 1,
        step: 0.01,
      },
      top_k: {
        value: defaults.top_k,
        min: 0,
        max: 100,
        step: 1,
      },
      frequency_penalty: {
        value: defaults.frequency_penalty,
        min: -2,
        max: 2,
        step: 0.01,
      },
      presence_penalty: {
        value: defaults.presence_penalty,
        min: -2,
        max: 2,
        step: 0.01,
      },
    }),
    [activeEngine?.key] // only recreate when the engine changes
  );

  // Sync to global state — but only when values actually change
  useEffect(() => {
    setAIState({
      max_tokens: values.max_tokens,
      max_response_tokens: values.max_response_tokens,
      temperature: values.temperature,
      top_p: values.top_p,
      top_k: values.top_k,
      frequency_penalty: values.frequency_penalty,
      presence_penalty: values.presence_penalty,
    });
  }, [
    values.max_tokens,
    values.max_response_tokens,
    values.temperature,
    values.top_p,
    values.top_k,
    values.frequency_penalty,
    values.presence_penalty,
    // intentionally NOT including setAIState
  ]);

  // When the user switches engine, force the controls to the new defaults
  useEffect(() => {
    if (activeEngine?.key && activeEngine.key !== prevEngineKey.current) {
      prevEngineKey.current = activeEngine.key;

      set({
        max_tokens: activeEngine.maxTokens ?? 8192,
        max_response_tokens: activeEngine.max_response_tokens ?? 2048,
        temperature: activeEngine.temperature ?? 0.6,
        top_p: activeEngine.top_p ?? 0.95,
        top_k: activeEngine.top_k ?? 40,
        frequency_penalty: activeEngine.frequency_penalty ?? 0,
        presence_penalty: activeEngine.presence_penalty ?? 0,
      });
    }
  }, [activeEngine?.key, set]);

  return (
    <div style={{ marginTop: 2, width: "99%", marginLeft: 1 }}>
      <Leva
        fill
        flat={false}
        oneLineLabels={true}
        hideTitleBar={false}
        collapsed={true}
        hidden={false}
      />
    </div>
  );
}