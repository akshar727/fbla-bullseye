"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

interface RecaptchaProps {
  onVerify: (token: string) => void;
}

export function Recaptcha({ onVerify }: RecaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      onVerify(token);
    }
  };

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      onChange={handleRecaptchaChange}
    />
  );
}
