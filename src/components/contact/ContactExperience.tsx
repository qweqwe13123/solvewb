import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { LeadConversationPanel } from "@/components/contact/LeadConversationPanel";
import { LeadInputCard } from "@/components/contact/LeadInputCard";
import { useLeadFlow, useScrollToBottom } from "@/hooks/use-lead-flow";
import { TELEGRAM_DISPLAY, TELEGRAM_URL } from "@/lib/contact";

type Step = "choose" | "request";

export function ContactExperience() {
  const [step, setStep] = useState<Step>("choose");
  const [chatText, setChatText] = useState("");
  const [chatFiles, setChatFiles] = useState<string[]>([]);
  const [quickMessages, setQuickMessages] = useState<string[]>([
    "Hello, hello",
    "We're glad you're here. Send us a message and we'll help you from here.",
  ]);
  const flow = useLeadFlow();
  const scrollRef = useScrollToBottom(flow.messages, flow.step, flow.status);

  const startRequest = () => {
    flow.resetFlow();
    setStep("request");
  };

  const backToChoose = () => {
    flow.resetFlow();
    setStep("choose");
  };

  const sendQuickMessage = () => {
    const trimmed = chatText.trim();
    if (!trimmed && chatFiles.length === 0) return;
    setQuickMessages((messages) => [
      ...messages,
      trimmed || "Uploaded files",
      ...(chatFiles.length ? [`Attached ${chatFiles.length} file${chatFiles.length > 1 ? "s" : ""}`] : []),
    ]);
    setChatText("");
    setChatFiles([]);
    startRequest();
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 0%, #faf6f0 0%, #efe6d8 45%, #e8dece 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 72% 38%, rgba(255,255,255,0.55) 0%, transparent 42%),
            radial-gradient(circle at 28% 62%, rgba(255,255,255,0.35) 0%, transparent 38%)
          `,
        }}
        aria-hidden
      />

      <Link
        to="/"
        className="relative z-10 mb-10 inline-flex items-center gap-2 text-sm text-[#8a8178] transition-colors hover:text-[#3d3832]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-20">
        <div
          ref={scrollRef}
          className={`min-w-0 flex-1 ${step === "request" ? "max-h-[min(85vh,720px)] overflow-y-auto pr-2" : ""}`}
        >
          <div className="rounded-3xl border border-[#e8e2d9] bg-white/90 p-4 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.25)] backdrop-blur sm:p-5">
            <div className="flex items-center gap-3 border-b border-[#ece7e0] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2c2824] text-sm font-semibold text-white">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-[#2c2824]">Solver Support</p>
                <p className="text-xs text-[#8a8178]">Online now</p>
              </div>
            </div>

            <div className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
              {quickMessages.map((message, index) => (
                <div
                  key={`${message}-${index}`}
                  className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-snug ${
                    index > 1
                      ? "ml-auto rounded-br-md bg-[#2c2824] text-white"
                      : "rounded-bl-md bg-[#ebe6df] text-[#4a4540]"
                  }`}
                >
                  {message}
                </div>
              ))}
            </div>

            {chatFiles.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {chatFiles.map((file) => (
                  <span
                    key={file}
                    className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs text-[#6d6258]"
                  >
                    {file}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex items-center gap-2 rounded-full border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2">
              <label className="grid size-9 cursor-pointer place-items-center rounded-full text-[#8a8178] transition-colors hover:bg-white hover:text-[#2c2824]">
                <Paperclip className="size-4" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const names = Array.from(event.target.files ?? []).map((file) => file.name);
                    setChatFiles(names);
                  }}
                />
              </label>
              <input
                value={chatText}
                onChange={(event) => setChatText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendQuickMessage();
                  }
                }}
                placeholder="Write a message..."
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#2c2824] outline-none placeholder:text-[#b9b0a6]"
              />
              <button
                type="button"
                onClick={sendQuickMessage}
                className="grid size-9 place-items-center rounded-full bg-[#2c2824] text-white transition-opacity hover:opacity-90"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>

          {step === "request" ? (
            <>
              <LeadConversationPanel messages={flow.messages} userInitial={flow.userInitial} />
              {flow.status === "submitting" ? (
                <div className="mt-4 w-fit rounded-2xl rounded-bl-md bg-[#ebe6df] px-4 py-3 text-sm text-[#8a8178]">
                  Sending your request…
                </div>
              ) : null}
            </>
          ) : (
            null
          )}
        </div>

        <div className="w-full shrink-0 lg:mt-4 lg:w-[min(100%,400px)]">
          {step === "choose" ? (
            <div className="rounded-2xl border border-[#e8e2d9] bg-white/95 p-6 shadow-[0_20px_60px_-24px_rgba(61,56,50,0.18)] sm:p-8">
              <p className="text-sm text-[#a39a90]">Get in touch</p>
              <h1 className="mt-2 text-xl font-medium leading-snug text-[#2c2824] sm:text-2xl">
                Choose how you&apos;d like to connect with us
              </h1>

              <ul className="mt-8 flex flex-col gap-3">
                <li>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-[#ece7e0] bg-[#faf8f5] px-4 py-4 transition-colors hover:border-[#229ED9]/40 hover:bg-[#f0f9ff]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#229ED9]/15 text-[#229ED9]">
                      <Send className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-[#2c2824]">Telegram</span>
                      <span className="text-sm text-[#8a8178]">{TELEGRAM_DISPLAY}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={startRequest}
                    className="flex w-full items-center gap-4 rounded-xl border border-[#ece7e0] bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-[#c4b8a8] hover:bg-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2c2824]/8 text-[#2c2824]">
                      <span className="text-sm font-semibold">✉</span>
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-[#2c2824]">Leave a request</span>
                      <span className="text-sm text-[#8a8178]">
                        Quick chat — we&apos;ll reach out soon
                      </span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={backToChoose}
                disabled={flow.status === "submitting"}
                className="self-start text-sm text-[#a39a90] transition-colors hover:text-[#2c2824] disabled:opacity-50"
              >
                ← Other ways to connect
              </button>
              {flow.step !== "done" ? (
                <LeadInputCard
                  step={flow.step}
                  textInput={flow.textInput}
                  onTextChange={flow.setTextInput}
                  selectedOption={flow.selectedOption}
                  onSelectOption={flow.setSelectedOption}
                  otherText={flow.otherText}
                  onOtherChange={flow.setOtherText}
                  error={flow.error}
                  disabled={flow.status === "submitting"}
                  onSubmitText={() => void flow.submitTextStep()}
                  onSubmitChoice={() => void flow.submitChoiceStep()}
                  onSkipMessenger={() => flow.skipMessenger()}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
