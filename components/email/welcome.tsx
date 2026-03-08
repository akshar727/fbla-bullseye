import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name?: string;
}

export default function WelcomeEmail({ name = "" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#2250f4",
                offwhite: "#fafbfb",
              },
            },
          },
        }}
      >
        <Preview>
          Welcome to Bullseye — your school&apos;s lost &amp; found
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
              Welcome to Bullseye
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hi {name},</Text>
                <Text className="text-base">
                  You&apos;re now part of Bullseye — Hickory Ridge High
                  School&apos;s lost &amp; found platform. Whether you&apos;ve
                  found something or lost something, we&apos;re here to help
                  reunite items with their owners.
                </Text>
                <Text className="text-base">
                  Here&apos;s how to get started:
                </Text>
              </Row>
            </Section>
            <ul>
              <li className="mb-4">
                <strong>Search for your lost items.</strong> Use the search and
                filters to browse through found items. If you see something that
                matches what you lost, click on it to view details and submit a
                claim.{" "}
                <Link href="https://bullseye-ashen.vercel.app/browse/">
                  Browse found items
                </Link>
                .
              </li>
              <li className="mb-4">
                <strong>Report other found items.</strong> When you find items
                throughout the school that have been misplaced, post them on the
                site. Be sure to be descriptive and use clear photos to help
                owners identify their belongings.{" "}
                <Link href="https://bullseye-ashen.vercel.app/report/found/">
                  Report a found item
                </Link>
                .
              </li>
              <li className="mb-4">
                <strong>View and approve claims.</strong> Once a claim is
                submitted, you can review it and approve it if it matches the
                found item. This will help ensure items are returned to their
                rightful owners.
              </li>
              <li className="mb-4">
                <strong>Return found items to their owners.</strong> Once an
                item is claimed and approved, coordinate with the claimant to
                return the item. You can communicate through the platform to
                arrange a safe and convenient exchange at the front office.
              </li>
            </ul>

            <Section className="text-center">
              <Button
                href="https://bullseye-ashen.vercel.app/dashboard"
                className="rounded-lg bg-[rgb(1,5,61)] px-[18px] py-[12px] text-white font-semibold"
              >
                Go to your dashboard
              </Button>
            </Section>
          </Container>

          <Container className="mt-[20px]">
            <Section>
              <Text className="text-sm text-center text-gray-500 mb-[16px]">
                You&apos;ll receive both email notifications and website
                notification when someone claims or inquires about your items,
                when your claims are accepted, and when your inquiries are
                responded to. You can opt out anytime by clicking the button
                below.
              </Text>
              <Row>
                <Column className="px-[20px] text-center">
                  <Link href="https://bullseye-ashen.vercel.app/unsubscribe">
                    Unsubscribe
                  </Link>
                </Column>
              </Row>
            </Section>
            <Text className="mb-[45px] text-center text-gray-400">
              Bullseye, 7321 Raging Ridge Rd, Harrisburg, NC 28075
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
