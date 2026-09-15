import { useContext, useEffect, useState } from "react";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  Search,
  Conversation,
  ConversationList,
  Sidebar,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

import ChatContext from "../context/ChatContext";

import { Typography } from "./Atoms/Typography";
import { AiOutlineCopy } from "react-icons/ai";
import { BsMarkdown } from "react-icons/bs";

import moment from "moment";
import {
  userAvatarLogo,
  gptAvatarLogo,
} from "../model/icons";

import { Box } from "../components/Atoms/Box";
import ReactMarkdown from "react-markdown";

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const ChatComponent = ({
  handleSendMessage,
  stream,
  prompt,
  handleOnClick,
}) => {
  const {
    chats,
    activeChatId,
    messages,
    isLoading,
    isMarkdownFormatEnabled,
    setIsMarkdownFormatEnabled,
    selectChat,
  } = useContext(ChatContext);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setIsMarkdownFormatEnabled(false);
  }, [activeChatId]);

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{ position: "relative", height: "92svh" }}
      onClick={() => handleOnClick()}
    >
      <MainContainer responsive>

        {/* =========================
            CHAT LIST / SIDEBAR
        ========================== */}

        <Sidebar position="left" scrollable={true}>
          <Search
            placeholder="Search..."
            value={searchText}
            onChange={(value) => setSearchText(value)}
          />

          <ConversationList>

            {filteredChats.map((chat) => (
              <Conversation
                key={chat._id}
                name={chat.title || "New Chat"}
                lastSenderName={
                  chat.messagesCount
                    ? `${chat.messagesCount} messages`
                    : ""
                }
                info={
                  chat.updatedAt
                    ? moment(chat.updatedAt).fromNow()
                    : ""
                }
                active={chat._id === activeChatId}
                onClick={() => selectChat(chat._id)}
              >
                <Avatar
                  src={gptAvatarLogo}
                  name="GPT Assistant"
                  status="available"
                />
              </Conversation>
            ))}

          </ConversationList>
        </Sidebar>

        {/* =========================
            ACTIVE CHAT
        ========================== */}

        <ChatContainer>

          <MessageList
            typingIndicator={
              isLoading ? (
                <TypingIndicator content="GPT is responding" />
              ) : undefined
            }
          >

            {/* Saved messages */}

            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const date = moment(msg.timestamp);

              if (!msg.content) {
                return null;
              }

              return (
                <Message
                  key={msg._id}
                  model={{
                    direction: isUser ? "incoming" : "outgoing",
                    position: "normal",
                  }}
                  avatarPosition="cl"
                >

                  <Message.CustomContent>

                    <Typography
                      fontSize={1}
                      fontWeight={isUser ? "normal" : "bold"}
                    >
                      {isUser ? (
                        msg.content
                      ) : isMarkdownFormatEnabled ? (
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </Typography>

                  </Message.CustomContent>

                  <Message.Footer
                    sender={isUser ? "You" : "GPT"}
                    sentTime={date.fromNow()}
                  >
                    <Box width="100%" spacing={0}>

                      {!isUser && (
                        <>
                          <span
                            style={{
                              color: "rgba(21,162,127,1)",
                              borderRadius: 3,
                              fontSize: ".5rem",
                            }}
                          >
                            {date.fromNow()}
                          </span>

                          {msg.engine && (
                            <span
                              style={{
                                color: "orange",
                                borderRadius: 3,
                                textAlign: "right",
                                fontSize: ".5rem",
                                paddingLeft: 10,
                              }}
                            >
                              By {msg.engine}
                            </span>
                          )}
                        </>
                      )}

                      {/* Copy */}

                      <span
                        style={{
                          marginTop: -2,
                          marginLeft: 3,
                          backgroundColor: "lightskyblue",
                          padding: "2px 2px 1px 1px",
                          borderRadius: 4,
                          width: 15,
                          height: 15,
                          display: "inline-block",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          copyToClipboard(msg.content)
                        }
                      >
                        <span
                          style={{
                            marginTop: -1,
                            marginLeft: 1,
                          }}
                        >
                          <AiOutlineCopy
                            size={13}
                            color="black"
                          />
                        </span>
                      </span>

                      {/* Markdown */}

                      {!isUser && (
                        <span
                          style={{
                            marginTop: -2,
                            marginLeft: 3,
                            backgroundColor: "purple",
                            padding: "2px 2px 1px 1px",
                            borderRadius: 4,
                            width: 15,
                            height: 15,
                            display: "inline-block",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setIsMarkdownFormatEnabled(
                              !isMarkdownFormatEnabled
                            )
                          }
                        >
                          <span
                            style={{
                              marginTop: -1,
                              marginLeft: 1,
                            }}
                          >
                            <BsMarkdown
                              size={14}
                              color="white"
                            />
                          </span>
                        </span>
                      )}

                    </Box>
                  </Message.Footer>

                  {isUser && (
                    <Avatar
                      src={userAvatarLogo}
                      name="User"
                    />
                  )}

                </Message>
              );
            })}

            {/* =========================
                STREAMING USER MESSAGE
            ========================== */}

            {prompt && stream && (
              <Message
                model={{
                  direction: "incoming",
                  position: "normal",
                }}
              >
                <Message.CustomContent>
                  <Typography>
                    {prompt}
                  </Typography>
                </Message.CustomContent>

                <Avatar
                  src={userAvatarLogo}
                  name="User"
                />
              </Message>
            )}

            {/* =========================
                STREAMING ASSISTANT MESSAGE
            ========================== */}

            {stream && (
              <Message
                model={{
                  direction: "outgoing",
                  position: "last",
                }}
              >
                <Message.CustomContent>
                  <Typography fontWeight="bold">
                    {stream}
                  </Typography>
                </Message.CustomContent>
              </Message>
            )}

          </MessageList>

          <MessageInput
            placeholder="Ask anything from GPT..."
            onSend={(value) => handleSendMessage(value)}
            disabled={isLoading}
          />

        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatComponent;