import styled from "styled-components";

import { FlexItem } from "../Atoms/FlexItem";
import { Typography } from "../Atoms/Typography";
import { Flex } from "../Atoms/Flex";

import { useContext } from "react";
import AIContext from "../../context/AIContext";

const ModelSelectBox = styled(Flex)`
  padding: 0 !important;
  margin: 0;
  width: 300px;
`;

const SelectBoxWrapper = styled(FlexItem)`
  margin-top: 1px;
`;

const EngineSelector = ({ engines }) => {
  const {
    activeEngine,
    changeEngine,
  } = useContext(AIContext);

  return (
    <ModelSelectBox>

      <FlexItem>
        <Typography
          fontSize={15}
          fontFamily="Verdana"
          lineHeight={1}
        >
          Models:
        </Typography>
      </FlexItem>

      <SelectBoxWrapper>

        <select
          value={activeEngine?.key || ""}
          onChange={(e) => {
            const engine = engines.find(
              (eng) => eng.key === e.target.value
            );

            if (engine) {
              changeEngine(engine);
            }
          }}
        >
          {engines.map((eng) => (
            <option
              key={eng.id}
              value={eng.key}
            >
              {eng.name}
            </option>
          ))}
        </select>

      </SelectBoxWrapper>

    </ModelSelectBox>
  );
};

export default EngineSelector;