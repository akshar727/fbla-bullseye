import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-primary text-white">
      {/* Main footer grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — School info */}
          <div className="space-y-3">
            {/* Logo + name */}
            <div className="flex items-center gap-2">
              <div className="bg-primary-foreground/20 rounded-md w-8 h-8 flex items-center justify-center">
                <img
                  src="/favicon.ico"
                  alt="Bullseye logo"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-lg font-bold">Bullseye</span>
            </div>
            <p className="text-sm text-white leading-relaxed">
              Pinpoint your lost items within seconds.
            </p>
            <div className="text-sm text-white space-y-0.5 pt-1">
              <p className="font-medium text-primary-foreground">
                Hickory Ridge High School
              </p>
              <p>7321 Raging Ridge Rd</p>
              <p>Harrisburg, NC 28075</p>
            </div>
          </div>

          {/* Col 2 — Contact */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="tel:+17045351934"
                  className="text-white hover:text-primary-foreground transition-colors"
                >
                  (704) 535-1934
                </a>
              </li>
              <li>
                <a
                  href="mailto:hrhsbullseye@gmail.com"
                  className="text-white hover:text-primary-foreground transition-colors"
                >
                  hrhsbullseye@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://hrhs.cabarrus.k12.nc.us/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-primary-foreground transition-colors"
                >
                  School website ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 — Web team */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Web Team
            </p>
            <ul className="space-y-2 text-sm text-white">
              <li>Akshar Desai</li>
              <li>Kaushik Medamanuri</li>
            </ul>
          </div>

          {/* Col 4 — Find us on */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Find Us On
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-white hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="size-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-white hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="size-4" />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-white hover:text-primary-foreground transition-colors"
                >
                  <Youtube className="size-4" />
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white">
          <p>
            © {new Date().getFullYear()} Hickory Ridge High School — Bullseye.
            All rights reserved.
          </p>
          <Link
            href="/tos"
            className="hover:text-primary-foreground transition-colors underline underline-offset-4"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
