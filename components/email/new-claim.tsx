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

interface NewClaimEmailProps {
  name?: string;
  itemName?: string;
}

export default function NewClaimEmail({
  name = "",
  itemName = "your item",
}: NewClaimEmailProps) {
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
        <Preview>New claim on {itemName} — Bullseye</Preview>
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
              New Claim Submitted
            </Heading>

            <Section>
              <Text className="text-base">Hi {name},</Text>
              <Text className="text-base">
                A claim has been made on your item <strong>{itemName}</strong>.
                Head to your dashboard to review the claim details and decide
                whether to approve or deny it.
              </Text>
            </Section>

            <Section className="text-center mt-[32px]">
              <Button
                href="https://bullseye-ashen.vercel.app/dashboard"
                className="rounded-lg bg-[rgb(1,5,61)] px-[18px] py-[12px] text-white font-semibold"
              >
                View Claim
              </Button>
            </Section>

            <Section>
              <Text className="text-sm text-gray-400 text-center mt-[32px]">
                If you believe this claim was made in error, you can deny it
                from your dashboard. If you have questions, contact us at{" "}
                hrhsbullseye@gmail.com.
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
