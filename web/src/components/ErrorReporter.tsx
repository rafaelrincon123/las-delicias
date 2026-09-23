"use client";

import { useEffect } from "react";
import { instalarReporteDeErrores } from "@/lib/reportarError";

export default function ErrorReporter() {
  useEffect(() => {
    instalarReporteDeErrores();
  }, []);
  return null;
}
