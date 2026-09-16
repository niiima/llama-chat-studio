import { useContext } from "react";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

import ChatContext from "../context/ChatContext";

import { Typography } from "./Atoms/Typography";
import { Box } from "./Atoms/Box";

import { AiOutlineCopy } from "react-icons/ai";
import { BsMarkdown } from "react-icons/bs";

import moment from "moment";
import ReactMarkdown from "react-markdown";

import {
  userAvatarLogo,
  gptAvatarLogo,
} from "../model/icons";

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
  isLoadingConversation,
}) => {
  const {
    activeChatId,
    activeChat,
    messages,
    isLoading,
    isMarkdownFormatEnabled,
    setIsMarkdownFormatEnabled,
  } = useContext(ChatContext);

  return (
    <div
      className="chat-shell"
      style={{
        position: "relative",
        // height: "92svh",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ======================================
          CHAT HEADER
          ====================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeChat?.title || "New Chat"}
          </div>

          {activeChat?.currentEngine && (
            <div
              style={{
                marginTop: 2,
                fontSize: "0.68rem",
                opacity: 0.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeChat.currentEngine}
            </div>
          )}
        </div>

        {/* Global Markdown switch */}
        <button
          type="button"
          onClick={() =>
            setIsMarkdownFormatEnabled(
              (previous) => !previous
            )
          }
          title={
            isMarkdownFormatEnabled
              ? "Disable Markdown"
              : "Enable Markdown"
          }
          style={{
            border: "none",
            borderRadius: 6,
            padding: "5px 8px",
            cursor: "pointer",
            background: isMarkdownFormatEnabled
              ? "purple"
              : "rgba(0,0,0,0.08)",
            color: isMarkdownFormatEnabled
              ? "white"
              : "inherit",
          }}
        >
          <BsMarkdown size={14} />
        </button>
      </div>

      {/* ======================================
          CHAT BODY
          ====================================== */}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* Loading conversation */}

        {isLoadingConversation ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: 0.6,
              padding: 20,
            }}
          >
            Loading conversation...
          </div>
        ) : !activeChatId ? (
          /* Empty state */
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: 0.55,
              padding: 30,
            }}
          >
            <div>
              <h3>Start a conversation</h3>

              <p>
                Create a new chat from the sidebar.
              </p>
            </div>
          </div>
        ) : (
          <MainContainer responsive>
            <ChatContainer>
              {/* ==================================
                  MESSAGE LIST
                  ================================== */}

              <MessageList
                typingIndicator={
                  isLoading ? (
                    <TypingIndicator
                      content="GPT is responding"
                    />
                  ) : undefined
                }
              >
                {/* ==================================
                    SAVED MESSAGES
                    ================================== */}

                {messages.map((msg) => {
                  const isUser = msg.role === "user";

                  if (!msg.content) {
                    return null;
                  }

                  const date = moment(msg.timestamp);

                  return (
                    <Message
                      key={msg._id}
                      model={{
                        direction: isUser
                          ? "incoming"
                          : "outgoing",
                        position: "normal",
                      }}
                      avatarPosition="cl"
                    >
                      <Message.CustomContent>
                        <Typography
                          fontSize={1}
                          fontWeight={
                            isUser
                              ? "normal"
                              : "bold"
                          }
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
                        <Box
                          width="100%"
                          spacing={0}
                        >
                          {!isUser && (
                            <>
                              <span
                                style={{
                                  color:
                                    "rgba(21,162,127,1)",
                                  fontSize: ".5rem",
                                }}
                              >
                                {date.fromNow()}
                              </span>

                              {msg.engine && (
                                <span
                                  style={{
                                    color: "orange",
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
                            role="button"
                            tabIndex={0}
                            title="Copy message"
                            style={{
                              marginTop: -2,
                              marginLeft: 3,
                              backgroundColor:
                                "lightskyblue",
                              padding:
                                "2px 2px 1px 1px",
                              borderRadius: 4,
                              width: 15,
                              height: 15,
                              display:
                                "inline-flex",
                              alignItems: "center",
                              justifyContent:
                                "center",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              copyToClipboard(
                                msg.content
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key === " "
                              ) {
                                copyToClipboard(
                                  msg.content
                                );
                              }
                            }}
                          >
                            <AiOutlineCopy
                              size={13}
                              color="black"
                            />
                          </span>

                          {/* Markdown */}
                          {!isUser && (
                            <span
                              role="button"
                              tabIndex={0}
                              title={
                                isMarkdownFormatEnabled
                                  ? "Disable Markdown"
                                  : "Enable Markdown"
                              }
                              style={{
                                marginTop: -2,
                                marginLeft: 3,
                                backgroundColor:
                                  isMarkdownFormatEnabled
                                    ? "purple"
                                    : "rgba(0,0,0,0.2)",
                                padding:
                                  "2px 2px 1px 1px",
                                borderRadius: 4,
                                width: 15,
                                height: 15,
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setIsMarkdownFormatEnabled(
                                  (previous) =>
                                    !previous
                                )
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key ===
                                    "Enter" ||
                                  event.key === " "
                                ) {
                                  setIsMarkdownFormatEnabled(
                                    (previous) =>
                                      !previous
                                  );
                                }
                              }}
                            >
                              <BsMarkdown
                                size={14}
                                color="white"
                              />
                            </span>
                          )}
                        </Box>
                      </Message.Footer>

                      <Avatar
                        src={
                          isUser
                            ? userAvatarLogo
                            : gptAvatarLogo
                        }
                        name={
                          isUser
                            ? "User"
                            : "GPT Assistant"
                        }
                      />
                    </Message>
                  );
                })}

                {/* ==================================
                    STREAMING USER MESSAGE
                    ================================== */}

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

                {/* ==================================
                    STREAMING ASSISTANT MESSAGE
                    ================================== */}

                {stream && (
                  <Message
                    model={{
                      direction: "outgoing",
                      position: "last",
                    }}
                  >
                    <Message.CustomContent>
                      <Typography
                        fontWeight="bold"
                      >
                        {isMarkdownFormatEnabled ? (
                          <ReactMarkdown>
                            {stream}
                          </ReactMarkdown>
                        ) : (
                          stream
                        )}
                      </Typography>
                    </Message.CustomContent>

                    <Avatar
                      src={gptAvatarLogo}
                      name="GPT Assistant"
                    />
                  </Message>
                )}
              </MessageList>

              {/* ==================================
                  COMPOSER
                  ================================== */}

              <MessageInput
                placeholder={
                  activeChatId
                    ? "Ask anything from GPT..."
                    : "Create a new chat first..."
                }
                onSend={(value) =>
                  handleSendMessage(value)
                }
                disabled={
                  isLoading || !activeChatId
                }
              />
            </ChatContainer>
          </MainContainer>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;