import { useId, useRef } from "react";
import {
  fromNativeDateTimeValue,
  fromNativeDateValue,
  maskDateInput,
  maskDateTimeInput,
  toNativeDateTimeValue,
  toNativeDateValue,
} from "../utils/format";

type PickerMode = "date" | "datetime";

interface PickerInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: PickerMode;
  placeholder?: string;
}

function PickerIcon({ mode }: { mode: PickerMode }) {
  if (mode === "date") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 4.8v2.4M17 4.8v2.4M5.5 8.2h13M6.8 6.5h10.4c.9 0 1.6.7 1.6 1.6v9.9c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6V8.1c0-.9.7-1.6 1.6-1.6Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.7v4.6l3 1.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function PickerInput({ value, onChange, mode, placeholder }: PickerInputProps) {
  const inputId = useId();
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const tooltipLabel = mode === "date" ? "Escolher data" : "Escolher data e hora";

  const nativeValue = mode === "date" ? toNativeDateValue(value) : toNativeDateTimeValue(value);

  const openPicker = () => {
    const input = nativeInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) {
      return;
    }
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  };

  return (
    <div className="picker-shell">
      <input
        className="date-input"
        inputMode="numeric"
        value={value}
        onChange={(event) =>
          onChange(mode === "date" ? maskDateInput(event.target.value) : maskDateTimeInput(event.target.value))
        }
        placeholder={placeholder}
      />
      <button className="picker-button" type="button" onClick={openPicker} aria-label={tooltipLabel} title={tooltipLabel}>
        <PickerIcon mode={mode} />
      </button>
      <input
        ref={nativeInputRef}
        id={inputId}
        className="native-picker-proxy"
        type={mode === "date" ? "date" : "datetime-local"}
        value={nativeValue}
        onChange={(event) =>
          onChange(
            mode === "date"
              ? fromNativeDateValue(event.target.value)
              : fromNativeDateTimeValue(event.target.value),
          )
        }
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
