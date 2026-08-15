import { BUDGET_OPTIONS, SERVICE_OPTIONS, TIMELINE_OPTIONS, type LeadFlowStep } from "@/lib/lead-schema";

type LeadInputCardProps = {
  step: LeadFlowStep;
  textInput: string;
  onTextChange: (value: string) => void;
  selectedOption: string | null;
  onSelectOption: (value: string) => void;
  otherText: string;
  onOtherChange: (value: string) => void;
  error: string | null;
  disabled: boolean;
  onSubmitText: () => void;
  onSubmitChoice: () => void;
  onSkipMessenger?: () => void;
};

function OkButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-sm text-[#a39a90] transition-colors hover:text-[#2c2824] disabled:cursor-not-allowed disabled:opacity-40"
    >
      OK <span aria-hidden>↵</span>
    </button>
  );
}

function ChoiceList({
  options,
  selected,
  onSelect,
  otherText,
  onOtherChange,
  showOther,
}: {
  options: readonly string[];
  selected: string | null;
  onSelect: (v: string) => void;
  otherText: string;
  onOtherChange: (v: string) => void;
  showOther: boolean;
}) {
  return (
    <ul className="mt-4 divide-y divide-[#ece7e0]">
      {options.map((option) => (
        <li key={option}>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-3.5">
            <span className="text-[15px] text-[#4a4540]">{option}</span>
            <input
              type="radio"
              name="lead-choice"
              checked={selected === option}
              onChange={() => onSelect(option)}
              className="h-4 w-4 shrink-0 border-[#d1d5db] text-[#2c2824] focus:ring-[#2c2824]"
            />
          </label>
        </li>
      ))}
      {showOther && selected === "Other" ? (
        <li className="pb-2 pt-1">
          <input
            type="text"
            value={otherText}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Tell us more…"
            className="w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-[15px] text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none"
          />
        </li>
      ) : null}
    </ul>
  );
}

export function LeadInputCard({
  step,
  textInput,
  onTextChange,
  selectedOption,
  onSelectOption,
  otherText,
  onOtherChange,
  error,
  disabled,
  onSubmitText,
  onSubmitChoice,
  onSkipMessenger,
}: LeadInputCardProps) {
  if (step === "done") return null;

  const onTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmitText();
    }
  };

  const onChoiceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmitChoice();
    }
  };

  return (
    <div
      className="rounded-2xl border border-[#e8e2d9] bg-white p-6 shadow-[0_24px_80px_-32px_rgba(61,56,50,0.22)] sm:p-8"
      onKeyDown={step === "service" || step === "budget" || step === "timeline" ? onChoiceKeyDown : onTextKeyDown}
    >
      {step === "name" ? (
        <>
          <p className="text-sm text-[#a39a90]">My name is</p>
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Your name…"
            disabled={disabled}
            autoFocus
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-8 flex justify-end">
            <OkButton onClick={onSubmitText} disabled={disabled || !textInput.trim()} />
          </div>
        </>
      ) : null}

      {step === "role" ? (
        <>
          <p className="text-sm text-[#a39a90]">I&apos;m a</p>
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Designer, Founder, Enterprise"
            disabled={disabled}
            autoFocus
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-8 flex justify-end">
            <OkButton onClick={onSubmitText} disabled={disabled || !textInput.trim()} />
          </div>
        </>
      ) : null}

      {step === "company" ? (
        <>
          <p className="text-sm text-[#a39a90]">at</p>
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Company name…"
            disabled={disabled}
            autoFocus
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-8 flex justify-end">
            <OkButton onClick={onSubmitText} disabled={disabled || !textInput.trim()} />
          </div>
        </>
      ) : null}

      {step === "email" ? (
        <>
          <p className="text-sm text-[#a39a90]">Email</p>
          <input
            type="email"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="you@company.com"
            disabled={disabled}
            autoFocus
            autoComplete="email"
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-8 flex justify-end">
            <OkButton onClick={onSubmitText} disabled={disabled || !textInput.trim()} />
          </div>
        </>
      ) : null}

      {step === "messenger" ? (
        <>
          <p className="text-sm text-[#a39a90]">You can also reach me on</p>
          <p className="mt-1 text-xs leading-relaxed text-[#b5aea4]">
            Telegram @username or t.me link
          </p>
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="@username or t.me/username"
            disabled={disabled}
            autoFocus
            autoComplete="tel"
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] placeholder:italic focus:border-[#2c2824] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-8 flex items-center justify-between gap-3">
            {onSkipMessenger ? (
              <button
                type="button"
                onClick={onSkipMessenger}
                disabled={disabled}
                className="text-sm text-[#a39a90] underline-offset-2 transition-colors hover:text-[#2c2824] hover:underline disabled:opacity-50"
              >
                Skip — email only
              </button>
            ) : (
              <span />
            )}
            <OkButton onClick={onSubmitText} disabled={disabled || !textInput.trim()} />
          </div>
        </>
      ) : null}

      {step === "service" ? (
        <>
          <p className="text-sm text-[#a39a90]">I am seeking a partner to help me with:</p>
          <ChoiceList
            options={SERVICE_OPTIONS}
            selected={selectedOption}
            onSelect={onSelectOption}
            otherText={otherText}
            onOtherChange={onOtherChange}
            showOther
          />
          <div className="mt-4 flex justify-end">
            <OkButton
              onClick={onSubmitChoice}
              disabled={
                disabled ||
                !selectedOption ||
                (selectedOption === "Other" && !otherText.trim())
              }
            />
          </div>
        </>
      ) : null}

      {step === "budget" ? (
        <>
          <p className="text-sm text-[#a39a90]">My budget is around:</p>
          <ChoiceList
            options={BUDGET_OPTIONS}
            selected={selectedOption}
            onSelect={onSelectOption}
            otherText={otherText}
            onOtherChange={onOtherChange}
            showOther
          />
          <div className="mt-4 flex justify-end">
            <OkButton
              onClick={onSubmitChoice}
              disabled={
                disabled ||
                !selectedOption ||
                (selectedOption === "Other" && !otherText.trim())
              }
            />
          </div>
        </>
      ) : null}

      {step === "timeline" ? (
        <>
          <p className="text-sm text-[#a39a90]">I&apos;d like this done in:</p>
          <ChoiceList
            options={TIMELINE_OPTIONS}
            selected={selectedOption}
            onSelect={onSelectOption}
            otherText={otherText}
            onOtherChange={onOtherChange}
            showOther={false}
          />
          <div className="mt-4 flex justify-end">
            <OkButton onClick={onSubmitChoice} disabled={disabled || !selectedOption} />
          </div>
        </>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[#c2410c]" role="alert">
          {error}
        </p>
      ) : null}

      {disabled && (step as string) !== "done" ? (
        <p className="mt-4 text-center text-sm text-[#a39a90]">Sending…</p>
      ) : null}
    </div>
  );
}
