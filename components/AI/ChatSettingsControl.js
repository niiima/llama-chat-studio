import React, { useContext, useEffect } from "react";
import { Leva, useControls } from "leva";

import AIContext from "../../context/AIContext";

export default function ChatSettingsControl() {
  const {
    setAIState,
    activeEngine,
  } = useContext(AIContext);

  const engine = activeEngine;

  const defaults = {
    max_tokens:
      engine?.maxTokens ?? 8192,

    max_response_tokens:
      engine?.max_response_tokens ?? 2048,

    temperature:
      engine?.temperature ?? 0.6,

    top_p:
      engine?.top_p ?? 0.95,

    top_k:
      engine?.top_k ?? 40,

    frequency_penalty:
      engine?.frequency_penalty ?? 0,

    presence_penalty:
      engine?.presence_penalty ?? 0,
  };

  const [values] = useControls(
    "Generation",
    () => ({
      max_tokens: {
        value: defaults.max_tokens,
        min: 512,
        max: defaults.max_tokens,
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
    [engine?.key]
  );

  useEffect(() => {
    if (!values) return;

    setAIState((previous) => {
      const next = {
        ...previous,

        max_tokens:
          values.max_tokens,

        max_response_tokens:
          values.max_response_tokens,

        temperature:
          values.temperature,

        top_p:
          values.top_p,

        top_k:
          values.top_k,

        frequency_penalty:
          values.frequency_penalty,

        presence_penalty:
          values.presence_penalty,
      };

      // Do not create a new state object
      // when nothing actually changed.
      const unchanged =
        previous.max_tokens ===
          next.max_tokens &&
        previous.max_response_tokens ===
          next.max_response_tokens &&
        previous.temperature ===
          next.temperature &&
        previous.top_p ===
          next.top_p &&
        previous.top_k ===
          next.top_k &&
        previous.frequency_penalty ===
          next.frequency_penalty &&
        previous.presence_penalty ===
          next.presence_penalty;

      return unchanged
        ? previous
        : next;
    });
  }, [
    values?.max_tokens,
    values?.max_response_tokens,
    values?.temperature,
    values?.top_p,
    values?.top_k,
    values?.frequency_penalty,
    values?.presence_penalty,
    setAIState,
  ]);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <Leva
        fill
        flat={false}
        oneLineLabels
        hideTitleBar={false}
        collapsed={false}
        hidden={false}
      />
    </div>
  );
}