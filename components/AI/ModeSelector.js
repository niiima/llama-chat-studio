import { modes, colorArray } from "../../model/Content";
import { Typography } from "../Atoms/Typography";
import styled from "styled-components";

const UlWrapper = styled.ul`
  border: 2px solid lightskyblue;
  background-color: white;
  border-radius: 10px;
  padding: 0;
  padding-left: 10px;
  margin: 0;
`;

const TypoItems = styled(Typography)``;
const ModeSelector = ({ handleChange }) => {
  return (
    <UlWrapper>
      {modes.map((mode, i) => (
        <li key={mode.name} style={{ listStyle: "none" }}>
          <TypoItems
            fontSize={2}
            lineHeight={2}
            fontWeight={"bold"}
            color={colorArray[i]}
            onClick={() => handleChange(mode.prompt)}>
            {mode.icon ? mode.icon : "⌫"} {mode.name}
          </TypoItems>
        </li>
      ))}
    </UlWrapper>
  );
};

export default ModeSelector;
