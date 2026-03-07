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

interface NewInquiryEmailProps {
  name?: string;
  itemName?: string;
}

export default function NewInquiryEmail({
  name = "",
  itemName = "your item",
}: NewInquiryEmailProps) {
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
        <Preview>New inquiry about {itemName} — Bullseye</Preview>
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
              New Inquiry Received
            </Heading>

            <Section>
              <Text className="text-base">Hi {name},</Text>
              <Text className="text-base">
                An inquiry has been made about your item{" "}
                <strong>{itemName}</strong>. Head to your dashboard to review
                the inquiry details and respond to the interested party.
              </Text>
            </Section>

            <Section className="text-center mt-[32px]">
              <Button
                href="https://bullseye-ashen.vercel.app/dashboard"
                className="rounded-lg bg-[rgb(1,5,61)] px-[18px] py-[12px] text-white font-semibold"
              >
                View Inquiry
              </Button>
            </Section>

            <Section>
              <Text className="text-sm text-gray-400 text-center mt-[32px]">
                If you have questions about this inquiry, contact us at{" "}
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
