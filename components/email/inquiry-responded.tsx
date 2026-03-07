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

interface InquiryRespondedEmailProps {
  name?: string;
  itemName?: string;
  response?: string;
}

export default function InquiryRespondedEmail({
  name = "",
  itemName = "the item",
  response = "The item owner has responded to your inquiry.",
}: InquiryRespondedEmailProps) {
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
        <Preview>Response to your inquiry about {itemName} — Bullseye</Preview>
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
              Inquiry Response Received
            </Heading>

            <Section>
              <Text className="text-base">Hi {name},</Text>
              <Text className="text-base">
                The owner of <strong>{itemName}</strong> has responded to your
                inquiry.
              </Text>
            </Section>

            <Section className="bg-[#fafbfb] p-[20px] rounded-lg my-[24px]">
              <Text className="text-base my-0 text-gray-700">{response}</Text>
            </Section>

            <Section className="text-center mt-[32px]">
              <Button
                href="https://bullseye-ashen.vercel.app/dashboard"
                className="rounded-lg bg-[rgb(1,5,61)] px-[18px] py-[12px] text-white font-semibold"
              >
                Open my Dashboard
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
