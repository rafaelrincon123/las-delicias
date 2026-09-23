"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "./icons";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

// Campo de contraseña con botón de ojo para ver/ocultar lo que se escribe.
export default function PasswordInput({ className, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={className}
        style={{ ...style, paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 w-11 flex items-center justify-center opacity-60 hover:opacity-100 transition"
        style={{ color: "currentColor" }}
        aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
        title={visible ? "Ocultar contraseña" : "Ver contraseña"}
      >
        {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
}
