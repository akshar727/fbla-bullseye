import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ClaimAcceptedEmailProps {
  name?: string;
  itemName?: string;
}

export default function ClaimAcceptedEmail({
  name = "",
  itemName = "the item",
}: ClaimAcceptedEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "rgb(1,5,61)",
                offwhite: "#fafbfb",
              },
            },
          },
        }}
      >
        <Preview>
          Your claim for {itemName} has been accepted — Bullseye
        </Preview>
        <Body className="bg-[#fafbfb] font-sans text-base">
          <Img
            src="https://bullseye-ashen.vercel.app/favicon.ico"
            width="80"
            height="80"
            alt="Bullseye"
            className="mx-auto mt-[40px] mb-[20px]"
          />
          <Container className="bg-white p-[45px]">
            <Heading className="my-0 text-center leading-8">
              Claim Accepted! 🎉
            </Heading>

            <Section>
              <Text className="text-base">Hi {name},</Text>
              <Text className="text-base">
                Great news! Your claim for <strong>{itemName}</strong> has been
                accepted. You can now coordinate with the item owner to arrange
                pickup or return.
              </Text>
              <Text className="text-base">
                Please check your dashboard for contact details and next steps.
              </Text>
            </Section>

            <Section className="text-center mt-[32px]">
              <Button
                href="https://bullseye-ashen.vercel.app/dashboard"
                className="rounded-lg bg-[rgb(1,5,61)] px-[18px] py-[12px] text-white font-semibold"
              >
                Go to Dashboard
              </Button>
            </Section>

            <Section>
              <Text className="text-sm text-gray-400 text-center mt-[32px]">
                If you have any questions, contact us at hrhsbullseye@gmail.com.
              </Text>
            </Section>
          </Container>

          <Text className="mb-[45px] text-center text-gray-400 text-sm">
            Bullseye, 7321 Raging Ridge Rd, Harrisburg, NC 28075
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
}
