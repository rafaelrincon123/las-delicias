import React from "react";

interface Props {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  colspan?: 1 | 2;
}

export default function FormRow({ label, hint, required, children, colspan = 1 }: Props) {
  return (
    <label className={colspan === 2 ? "md:col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
      <span className="eyebrow">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
