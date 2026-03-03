export async function verifyCaptcha(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
