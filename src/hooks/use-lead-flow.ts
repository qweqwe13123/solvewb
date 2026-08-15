import { useCallback, useEffect, useRef, useState } from "react";
import { submitLead } from "@/lib/api/lead.functions";
import {
  BUDGET_OPTIONS,
  leadSchema,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  type LeadFlowStep,
  type LeadPayload,
} from "@/lib/lead-schema";

export type ConversationMessage = {
  id: string;
  kind: "bot-light" | "bot-dark" | "user";
  text: string;
  meta?: string;
};

type Answers = Partial<LeadPayload>;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function userMeta(answers: Answers): string | undefined {
  const parts: string[] = [];
  if (answers.name) parts.push(answers.name);
  if (answers.role) parts.push(answers.role);
  if (answers.company) parts.push(`@ ${answers.company}`);
  return parts.length ? parts.join(" · ") : undefined;
}

export function useLeadFlow() {
  const [step, setStep] = useState<LeadFlowStep>("name");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [textInput, setTextInput] = useState("");
  const [otherText, setOtherText] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "submitting" | "done">("active");

  const pushBot = useCallback((kind: "bot-light" | "bot-dark", text: string) => {
    setMessages((prev) => [...prev, { id: newId(), kind, text }]);
  }, []);

  const pushUser = useCallback((text: string, nextAnswers: Answers) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), kind: "user", text, meta: userMeta(nextAnswers) },
    ]);
  }, []);

  const resetFlow = useCallback(() => {
    setStep("name");
    setMessages([]);
    setAnswers({});
    setTextInput("");
    setOtherText("");
    setSelectedOption(null);
    setError(null);
    setStatus("active");
  }, []);

  const submitToTelegram = useCallback(
    async (payload: LeadPayload, displayName: string) => {
      setStatus("submitting");
      setError(null);
      try {
        await submitLead(payload);
        pushBot(
          "bot-light",
          `Thank you, ${displayName}! I'll be in touch soon 🙌\n\nIn the meantime, feel free to reach out anytime.`,
        );
        setStep("done");
        setStatus("done");
      } catch (err) {
        setStatus("active");
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    },
    [pushBot],
  );

  const advanceAfterAnswer = useCallback(
    (key: LeadFlowStep, value: string, nextAnswers: Answers) => {
      pushUser(value, nextAnswers);

      switch (key) {
        case "name":
          setStep("role");
          break;
        case "role":
          setStep("company");
          break;
        case "company": {
          const firstName = nextAnswers.name?.split(/\s+/)[0] ?? nextAnswers.name ?? "there";
          pushBot("bot-light", `Nice to meet you, ${firstName} 🙌`);
          pushBot("bot-dark", "What's the best email to reach you?");
          setStep("email");
          break;
        }
        case "email":
          pushBot("bot-dark", "How can we also reach you on Telegram?");
          setStep("messenger");
          break;
        case "messenger":
          pushBot("bot-light", "Perfect, thanks!");
          pushBot("bot-dark", "How may I help you today?");
          setStep("service");
          break;
        case "service":
          pushBot("bot-light", "Thanks for sharing!");
          pushBot("bot-dark", "Do you have a budget range in mind?");
          setStep("budget");
          break;
        case "budget":
          pushBot("bot-light", "Got it, that helps a lot.");
          pushBot("bot-dark", "And what's your ideal timeline?");
          setStep("timeline");
          break;
        case "timeline": {
          const parsed = leadSchema.safeParse(nextAnswers);
          if (!parsed.success) {
            setError(parsed.error.errors[0]?.message ?? "Please check your answers.");
            return;
          }
          void submitToTelegram(parsed.data, parsed.data.name.split(/\s+/)[0] ?? parsed.data.name);
          break;
        }
        default:
          break;
      }
    },
    [pushBot, pushUser, submitToTelegram],
  );

  const submitTextStep = useCallback(() => {
    if (status !== "active") return;

    const trimmed = textInput.trim();
    if (!trimmed) {
      setError("Please enter a value.");
      return;
    }

    setError(null);

    if (step === "name") {
      const next = { ...answers, name: trimmed };
      setAnswers(next);
      setTextInput("");
      advanceAfterAnswer("name", trimmed, next);
      return;
    }

    if (step === "role") {
      const next = { ...answers, role: trimmed };
      setAnswers(next);
      setTextInput("");
      advanceAfterAnswer("role", trimmed, next);
      return;
    }

    if (step === "company") {
      const next = { ...answers, company: trimmed };
      setAnswers(next);
      setTextInput("");
      advanceAfterAnswer("company", trimmed, next);
      return;
    }

    if (step === "email") {
      const emailResult = leadSchema.shape.email.safeParse(trimmed);
      if (!emailResult.success) {
        setError(emailResult.error.errors[0]?.message ?? "Invalid email");
        return;
      }
      const next = { ...answers, email: trimmed };
      setAnswers(next);
      setTextInput("");
      advanceAfterAnswer("email", trimmed, next);
      return;
    }

    if (step === "messenger") {
      const next = { ...answers, messengerContact: trimmed };
      setAnswers(next);
      setTextInput("");
      advanceAfterAnswer("messenger", trimmed, next);
    }
  }, [advanceAfterAnswer, answers, status, step, textInput]);

  const skipMessenger = useCallback(() => {
    if (status !== "active" || step !== "messenger") return;
    setError(null);
    setTextInput("");
    const next = { ...answers, messengerContact: "Email only" };
    setAnswers(next);
    advanceAfterAnswer("messenger", "Email only", next);
  }, [advanceAfterAnswer, answers, status, step]);

  const submitChoiceStep = useCallback(() => {
    if (status !== "active") return;

    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }

    const isOther = selectedOption === "Other";
    const custom = otherText.trim();
    if (isOther && !custom) {
      setError("Please describe your answer.");
      return;
    }

    const value = isOther ? `Other: ${custom}` : selectedOption;
    setError(null);
    setSelectedOption(null);
    setOtherText("");

    if (step === "service") {
      const next = { ...answers, service: value };
      setAnswers(next);
      advanceAfterAnswer("service", value, next);
      return;
    }

    if (step === "budget") {
      const next = { ...answers, budget: value };
      setAnswers(next);
      advanceAfterAnswer("budget", value, next);
      return;
    }

    if (step === "timeline") {
      const next = { ...answers, timeline: value };
      setAnswers(next);
      advanceAfterAnswer("timeline", value, next);
    }
  }, [advanceAfterAnswer, answers, otherText, selectedOption, status, step]);

  useEffect(() => {
    setTextInput("");
    setOtherText("");
    setSelectedOption(null);
    setError(null);
  }, [step]);

  const userInitial = answers.name?.charAt(0)?.toUpperCase() ?? "Y";

  return {
    step,
    messages,
    answers,
    textInput,
    setTextInput,
    otherText,
    setOtherText,
    selectedOption,
    setSelectedOption,
    error,
    status,
    resetFlow,
    submitTextStep,
    submitChoiceStep,
    skipMessenger,
    userInitial,
  };
}

export function useScrollToBottom(dep1: unknown, dep2: unknown, dep3: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [dep1, dep2, dep3]);
  return ref;
}
