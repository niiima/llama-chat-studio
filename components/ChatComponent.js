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

import ChatControls from "./ChatControls";

import { Typography } from "./Atoms/Typography";
import { Box } from "./Atoms/Box";

import { AiOutlineCopy } from "react-icons/ai";
import { BsMarkdown } from "react-icons/bs";

import moment from "moment";
import ReactMarkdown from "react-markdown";

import {
  userAvatarLogo,
  gptAvatarLogo,
} from "../lib/icons";

import ThinkingBlock from "./ThinkingBlock";

import styled from "styled-components";

import {
  FiCopy,
  FiMessageSquare,
  FiCpu,
} from "react-icons/fi";

const ChatShell = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0f172a;
`;

const ConversationHeader = styled.div`
  height: 52px;
  min-height: 52px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 0 14px;

  box-sizing: border-box;

  background: #111827;

  border-bottom: 1px solid #374151;

  color: #f3f4f6;
`;

const ConversationIdentity = styled.div`
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConversationIcon = styled.div`
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: #1f2937;
  color: #93c5fd;

  border: 1px solid #374151;
`;

const ConversationTitleGroup = styled.div`
  min-width: 0;
`;

const ConversationTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 600;

  color: #f3f4f6;
`;

const ConversationEngine = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  margin-top: 2px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 0.62rem;

  color: #6b7280;
`;

const MarkdownButton = styled.button`
  width: 32px;
  height: 32px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #374151;
  border-radius: 7px;

  background: ${({ active }) =>
    active ? "#273449" : "#1f2937"};

  color: ${({ active }) =>
    active ? "#93c5fd" : "#9ca3af"};

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #273449;
    border-color: #4b5563;
    color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const ConversationArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;

  .cs-message-list {
    height: 100%;
    min-height: 0;
    background: #0f172a;
    padding: 18px 18px 8px;
  }
`;

const ChatScope = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;

  --cs-color-primary: #60a5fa;

  .cs-main-container {
    width: 100%;
    height: 100%;
    min-height: 0;

    background: transparent !important;
    border: none !important;
  }

  .cs-chat-container {
    width: 100%;
    height: 100%;
    min-height: 0;

    display: flex;
    flex-direction: column;

    background: transparent !important;
    border: none !important;
  }

  /* -------------------------
     MESSAGE LIST
     ------------------------- */

  .cs-message-list {
    flex: 1 1 auto;
    min-height: 0;

    height: auto !important;

    padding: 18px 22px 12px !important;

    background: #0f172a !important;
  }

  /* -------------------------
     MESSAGES
     ------------------------- */

  .cs-message {
    margin-bottom: 10px !important;
  }

  .cs-message__content {
    border-radius: 10px !important;
    border: 1px solid #374151 !important;
    box-shadow: none !important;

    color: #e5e7eb !important;

    font-size: 0.82rem !important;
    line-height: 1.55 !important;
  }

  /* AI */

  .cs-message--incoming .cs-message__content {
    background: #111827 !important;
  }

  /* User */

  .cs-message--outgoing .cs-message__content {
    background: #1f2937 !important;
    border-color: #374151 !important;
  }

  /* -------------------------
     AVATARS
     ------------------------- */

  .cs-message__avatar {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;

    margin: 3px 7px 0 !important;
  }

  .cs-avatar {
    width: 28px !important;
    height: 28px !important;

    margin: 3px 7px 0 !important;
  }

  .cs-avatar > img {
    width: 28px !important;
    height: 28px !important;

    border-radius: 8px !important;
    border: 1px solid #374151 !important;

    object-fit: cover;
  }

  /* -------------------------
     FOOTER / TIMESTAMP
     ------------------------- */

  .cs-message__footer {
    margin-top: 3px !important;

    color: #64748b !important;

    font-size: 0.58rem !important;
    line-height: 1.2 !important;
  }

  /* -------------------------
     TYPING
     ------------------------- */

  .cs-typing-indicator {
    background: #111827 !important;
    border: 1px solid #374151 !important;

    color: #9ca3af !important;

    box-shadow: none !important;
  }

  /* -------------------------
     COMPOSER
     ------------------------- */

  .cs-message-input {
    flex: 0 0 auto;

    margin: 0 !important;
    padding: 10px 16px 14px !important;

    background: #111827 !important;

    border-top: 1px solid #374151 !important;

    box-shadow:
      0 -5px 16px rgba(0, 0, 0, 0.12) !important;
  }

  .cs-message-input__content-editor-wrapper {
    background: #f8fafc !important;

    border: 1px solid #cbd5e1 !important;
    border-radius: 12px !important;

    box-shadow:
      0 2px 5px rgba(0, 0, 0, 0.08),
      0 8px 20px rgba(0, 0, 0, 0.08) !important;

    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .cs-message-input__content-editor-wrapper:focus-within {
    border-color: #60a5fa !important;

    box-shadow:
      0 2px 5px rgba(0, 0, 0, 0.08),
      0 8px 20px rgba(0, 0, 0, 0.08),
      0 0 0 2px rgba(96, 165, 250, 0.12) !important;
  }

  .cs-message-input__content-editor-container {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .cs-message-input__content-editor {
    min-height: 42px !important;
    max-height: 140px !important;

    padding: 11px 14px !important;

    background: transparent !important;

    color: #111827 !important;

    font-family: inherit !important;
    font-size: 0.82rem !important;
    line-height: 1.45 !important;

    outline: none !important;
    box-shadow: none !important;
  }

  .cs-message-input__content-editor::placeholder {
    color: #94a3b8 !important;
    opacity: 1 !important;
  }

  /* Send button */

  .cs-button--send {
    color: #2563eb !important;

    background: transparent !important;
    border-radius: 8px !important;
  }

  .cs-button--send:hover {
    color: #1d4ed8 !important;
    background: #eff6ff !important;
  }
`;

const EmptyState = styled.div`
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 32px;

  box-sizing: border-box;

  background:
    radial-gradient(  
      circle at center,
      rgba(96, 165, 250, 0.045),
      transparent 45%
    );
`;

const EmptyStateContent = styled.div`
  max-width: 420px;

  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;

  margin: 0 auto 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #1f2937;
  color: #93c5fd;

  border: 1px solid #374151;
`;

const EmptyTitle = styled.h3`
  margin: 0;

  color: #e5e7eb;

  font-size: 0.95rem;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  margin: 7px 0 0;

  color: #6b7280;

  font-size: 0.75rem;
  line-height: 1.5;
`;

const FooterAction = styled.button`
  width: 23px;
  height: 23px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-left: 5px;

  padding: 0;

  border: 1px solid #374151;
  border-radius: 5px;

  background: #1f2937;
  color: #9ca3af;

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: #273449;
    border-color: #4b5563;
    color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 1px;
  }
`;

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(
      "Failed to copy:",
      error
    );
  }
};

export default function ChatComponent({
  handleSendMessage,
  stream,
  prompt,

  isLoadingConversation,

  engines,
  activeEngine,
  onEngineChange,

  systemPrompt,
  onSystemPromptChange,
  onSystemPromptBlur,

  mode,
  act,
  onModeChange,
  onActChange,

  enableThinking,
  // showReasoning,
  onThinkingChange,
  onShowReasoningChange,
}) {
  const {
    activeChatId,
    activeChat,
    messages,
    isLoading,

    isMarkdownFormatEnabled,
    setIsMarkdownFormatEnabled,
  } = useContext(ChatContext);

  const showReasoning =
    activeChat?.settings?.showReasoning ?? true;

  return (
    <ChatShell>
      {/* Conversation header */}
      <ConversationHeader>
        <ConversationIdentity>
          <ConversationIcon>
            <FiMessageSquare size={15} />
          </ConversationIcon>

          <ConversationTitleGroup>
            <ConversationTitle>
              {activeChat?.title || "New Chat"}
            </ConversationTitle>

            {activeChat?.currentEngine && (
              <ConversationEngine>
                <FiCpu size={10} />
                {activeChat.currentEngine}
              </ConversationEngine>
            )}
          </ConversationTitleGroup>
        </ConversationIdentity>

        <MarkdownButton
          type="button"
          active={isMarkdownFormatEnabled}
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
          aria-label={
            isMarkdownFormatEnabled
              ? "Disable Markdown"
              : "Enable Markdown"
          }
        >
          <BsMarkdown size={14} />
        </MarkdownButton>
      </ConversationHeader>

      {/* Conversation */}
      <ConversationArea>
        {isLoadingConversation ? (
          <EmptyState>
            <EmptyStateContent>
              <EmptyIcon>
                <FiMessageSquare size={20} />
              </EmptyIcon>

              <EmptyTitle>
                Loading conversation
              </EmptyTitle>

              <EmptyDescription>
                Restoring your messages and conversation
                settings...
              </EmptyDescription>
            </EmptyStateContent>
          </EmptyState>
        ) : !activeChatId ? (
          <EmptyState>
            <EmptyStateContent>
              <EmptyIcon>
                <FiMessageSquare size={20} />
              </EmptyIcon>

              <EmptyTitle>
                Start a conversation
              </EmptyTitle>

              <EmptyDescription>
                Create a new chat from the sidebar,
                choose your model and start talking.
              </EmptyDescription>
            </EmptyStateContent>
          </EmptyState>
        ) : (
          <ChatScope>
            <MainContainer responsive>
              <ChatContainer>
                <MessageList
                  typingIndicator={
                    isLoading ? (
                      <TypingIndicator
                        content="AI is responding"
                      />
                    ) : undefined
                  }
                >
                  {messages.map((msg, index) => {
                    const isUser =
                      msg.role === "user";

                    if (
                      !msg.content &&
                      !msg.reasoning
                    ) {
                      return null;
                    }

                    const date = moment(
                      msg.timestamp
                    );

                    return (
                      <Message
                        key={
                          msg._id ||
                          msg.id ||
                          `message-${index}`
                        }
                        model={{
                          message:
                            msg.content || "",
                          direction: isUser
                            ? "incoming"
                            : "outgoing",
                          position: "single",
                        }}
                      >
                        <Message.CustomContent>
                          <ThinkingBlock
                            reasoning={
                              msg.reasoning
                            }
                            visible={
                              showReasoning
                            }
                            isStreaming={false}
                          />

                          {msg.content && (
                            <Typography fontWeight="bold">
                              {isMarkdownFormatEnabled ? (
                                <ReactMarkdown>
                                  {msg.content}
                                </ReactMarkdown>
                              ) : (
                                msg.content
                              )}
                            </Typography>
                          )}
                        </Message.CustomContent>

                        <Message.Footer sentTime={date.format("HH:mm")}>
                          {!isUser && msg.engine && (
                            <span style={{ marginLeft: 6 }}>
                              {msg.engine}
                            </span>
                          )}

                          <FooterAction
                            type="button"
                            title="Copy message"
                            aria-label="Copy message"
                            onClick={() => copyToClipboard(msg.content || "")}
                          >
                            <FiCopy size={11} />
                          </FooterAction>
                        </Message.Footer>

                        {/* <Avatar
                          src={
                            isUser
                              ? userAvatarLogo
                              : gptAvatarLogo
                          }
                          name={
                            isUser
                              ? "User"
                              : "AI Assistant"
                          }
                        /> */}
                      </Message>
                    );
                  })}

                  {/* Temporary user message */}
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

                      {/* <Avatar
                        src={userAvatarLogo}
                        name="User"
                      /> */}
                    </Message>
                  )}

                  {/* Streaming assistant */}
                  {stream && (
                    <Message
                      model={{
                        direction: "outgoing",
                        position: "last",
                      }}
                    >
                      <Message.CustomContent>
                        <ThinkingBlock
                          reasoning={
                            stream.reasoning
                          }
                          visible={
                            showReasoning
                          }
                          isStreaming={
                            isLoading
                          }
                        />

                        {stream.content && (
                          <Typography>
                            {isMarkdownFormatEnabled ? (
                              <ReactMarkdown>
                                {stream.content}
                              </ReactMarkdown>
                            ) : (
                              stream.content
                            )}
                          </Typography>
                        )}
                      </Message.CustomContent>

                      {/* <Avatar
                        src={gptAvatarLogo}
                        name="AI Assistant"
                      /> */}
                    </Message>
                  )}
                </MessageList>

                <MessageInput
                  placeholder={
                    activeChatId
                      ? "Ask anything..."
                      : "Create a new chat first..."
                  }
                  onSend={handleSendMessage}
                  disabled={
                    isLoading ||
                    !activeChatId
                  }
                />
              </ChatContainer>
            </MainContainer>
          </ChatScope>
        )}
      </ConversationArea>

      {/* AI generation controls */}
      <ChatControls
        engines={engines}
        activeEngine={activeEngine}
        onEngineChange={onEngineChange}
        systemPrompt={systemPrompt}
        onSystemPromptChange={
          onSystemPromptChange
        }
        onSystemPromptBlur={
          onSystemPromptBlur
        }
        mode={mode}
        act={act}
        onModeChange={onModeChange}
        onActChange={onActChange}
        enableThinking={enableThinking}
        showReasoning={showReasoning}
        onThinkingChange={onThinkingChange}
        onShowReasoningChange={
          onShowReasoningChange
        }
      />
    </ChatShell>
  );
}