import { useState, useContext, useRef, useEffect } from "react";
import Head from "next/head";
import { engines } from "../model/model.js";
import AuthContext from "../context/AuthContext.js";
// import ChatContext from "../context/ChatContext.js";
import AIContext from "../context/AIContext.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import ChatSettingsControl from "../components/AI/ChatSettingsControl.js";
import Header from "../components/Header/Header.js";
import UIContext from "../context/UIContext.js";
import ColorfulButtonSet from "../components/Buttons/ColorfulButtons.js";
import GroupRadioButtons from "../components/Inputs/GroupRadio/GroupRadioButtons.js";
import { Box } from "../components/Atoms/Box.js";
import OrdinaryButton from "../components/Buttons/OrdinaryButton.js";
import ResponsiveTable from "../components/Lists/ResponsiveTable.js";
import { MdOutlineFileDownload } from "react-icons/md";
import PreLoader from "../components/Loadings/PreLoader.js";
import { FlexItem } from "../components/Atoms/FlexItem.js";
import { Flex } from "../components/Atoms/Flex.js";
import MusicBarLoading from "../components/Loadings/MusicBarLoading.js";
import BoxLoading from "../components/Loadings/BoxLoading/BoxLoading.js";

import InputLine from "../components/Inputs/InputLine.js";
export default function MyPage() {
  const {
    asideExpanded,
    setAsideExpand,
    isPageInLoadingState,
    setIsPageInLoadingState,
  } = useContext(UIContext);
  // const { chatHistory, addToHistory, isLoading, setIsLoading } =
  //   useContext(ChatContext);

  const { AIstate, setAIState } = useContext(AIContext);
  // const { spotifyAccessToken, setSpotifyAccessToken } = useContext(AuthContext);
  const [isPlaylistGenerating, setIsPlaylistGenerating] = useState(false);
  const [activeEngine, setActiveEngine] = useState(engines[0]);
  const [playlist, setPlaylist] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState(
    "Make a Playlist of "
  );
  const [playlistObject, setPlaylistObject] = useState(null);

  const generateJsonPlaylist = async () => {
    setIsPlaylistGenerating(true);
    setErrorMessage("Generating your playlist . . . ");
    try {
      let options = {
        engine: activeEngine.key,
        message: playlistDescription,
        ...AIstate,
      };
      // console.log(options);
      const response = await fetch("/api/playlist/generate-json-playlist", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (response.status !== 200) {
        setErrorMessage(res.error);
        setIsPlaylistGenerating(false);
        return [];
      }
      const res = await response.json();
      // console.log(res);
      setPlaylistObject(res);
      const playlistFetchResult = await getPlaylistTracks(res);
      // console.log(playlistFetchResult);
      if (playlistFetchResult == undefined) {
        setErrorMessage(
          "Cant generate playlist base on the given description, Please try again."
        );
        setIsPlaylistGenerating(false);
        return;
      }
      setIsPlaylistGenerating(false);
      setErrorMessage("");
      setPlaylist(playlistFetchResult || []);
    } catch (error) {
      console.log(error);
    }
  };

  async function getPlaylistTracks(jsonPlaylist) {
    setIsPlaylistGenerating(false);
    setErrorMessage("Fetching songs from Spotify . . .");
    setIsPageInLoadingState(true);
    const response = await fetch("/api/playlist/get-playlist-tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonPlaylist),
    });
    if (response.status !== 200) {
      setIsPageInLoadingState(false);
      setErrorMessage(response.error);
      // setErrorMessage("Could't find any of generated tracks on Spotify.");
      return;
    }

    const res = await response.json();
    setIsPageInLoadingState(false);

    return res || []; //setPlaylist(res);
  }

  return (
    <div>
      <Head>
        <title>Playlist Generator</title>
      </Head>
      <Sidebar show={asideExpanded}>
        <ChatSettingsControl aiType='classic' />
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
      <Box
        background={"#111"}
        width={"100%"}
        padding={1}
        color='white'
        onClick={() => setAsideExpand(false)}>
        <Flex padding={0} margin={0} spacing={0}>
          <FlexItem width={"95%"}>
            <InputLine
              value={playlistDescription}
              handleChange={(e) => {
                setErrorMessage("");
                setPlaylistDescription(e);
              }}
            />
          </FlexItem>
          <FlexItem width={"5%"}>
            <MdOutlineFileDownload
              style={{ position: "absolute", marginTop: 10 }}
              onClick={() => generateJsonPlaylist()}
              size={30}
              color={"lightskyblue"}
            />
          </FlexItem>
        </Flex>
      </Box>
      <Box
        className='scroll-customized'
        paddingTop={1}
        background={"#222"}
        width={"100%"}
        // paddingLeft={"1rem"}
        // paddingRight={"1rem"}
        overflowY='auto'
        height='85svh'>
        {isPlaylistGenerating && <BoxLoading />}
        {isPageInLoadingState && <MusicBarLoading />}
        {errorMessage.length > 0 && (
          <span className='error-message'>{errorMessage}</span>
        )}
        {playlist &&
          playlist.map((track) => {
            return (
              <div key={track.id}>
                {track && track["artists"] && track.artists[0] && (
                  <iframe
                    src={`https://open.spotify.com/embed?uri=${track.uri}`}
                    width='100%'
                    height='80'
                    frameBorder='0'
                    allowTransparency='true'></iframe>
                )}
              </div>
            );
          })}
      </Box>
    </div>
  );
}
