"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const fullText = "Planixa";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      setIndex((prev) => (prev + 1) % (fullText.length + 1));
    }, 400);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="relative">
      {/* ━━ HERO — Asymmetric split, left-heavy typography ━━ */}
      <section className="min-h-[90vh] flex items-center">
        <div className="w-full px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20 items-center max-w-[1200px]">
            {/* Left: oversized display type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Monospace label above heading */}
              <span className="mono block mb-4" style={{ color: 'var(--amber)' }}>
                ◆ Task Management
              </span>

              <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Organize{" "}
                <br className="hidden sm:block" />
                your work{" "}
                <br className="hidden sm:block" />
                with{" "}
                <span style={{ color: 'var(--amber)' }}>
                  {displayedText}
                  <span className="animate-pulse" style={{ color: 'var(--text-faint)' }}>_</span>
                </span>
              </h1>

              <p
                className="mt-6 max-w-md"
                style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: '1.7' }}
              >
                A focused task management tool. Create, track, and manage
                your work with precision and clarity.
              </p>

              {/* Action buttons — stacked style */}
              <div className="mt-10 flex gap-3">
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
                <Link href="/login" className="btn-secondary">
                  Sign In →
                </Link>
              </div>
            </motion.div>

            {/* Right: structured feature readout — like instrument data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div style={{ borderLeft: '1px solid var(--rule-strong)', paddingLeft: '2rem' }}>
                {[
                  { label: "01", title: "Quick creation", desc: "Add tasks with a title and optional description." },
                  { label: "02", title: "Clean interface", desc: "Distraction-free design for focused work." },
                  { label: "03", title: "Secure & private", desc: "Your data is encrypted and only accessible to you." },
                ].map((item, i) => (
                  <div key={i} className={i > 0 ? "mt-8" : ""}>
                    <span className="mono" style={{ color: 'var(--amber-dim)' }}>
                      {item.label}
                    </span>
                    <h3
                      className="mt-1 font-semibold"
                      style={{ color: 'var(--text-primary)', fontSize: '1.125rem', letterSpacing: '-0.02em' }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ HOW IT WORKS — Horizontal ruled list ━━ */}
      <section style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="px-6 lg:px-10 py-14 max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="mono" style={{ color: 'var(--amber)' }}>
              ◆ How It Works
            </span>
            <h2 className="display mt-3" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              Three steps to clarity
            </h2>
          </motion.div>

          <div className="mt-8 grid md:grid-cols-3" style={{ borderTop: '1px solid var(--rule)' }}>
            {[
              { step: "01", title: "Create Tasks", desc: "Add tasks with titles and optional descriptions to capture your work." },
              { step: "02", title: "Edit & Manage", desc: "Update, edit, or delete tasks as your priorities shift." },
              { step: "03", title: "Track Progress", desc: "View all tasks in one place and stay organized daily." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                /* Right border only on md+ via classname; stacked on mobile uses bottom border only */
                className={`py-6 pr-6 ${i > 0 ? 'md:pl-6' : ''} ${i < 2 ? 'md:border-r' : ''}`}
                style={{
                  borderBottom: '1px solid var(--rule)',
                  borderColor: 'var(--rule)',
                }}
              >
                <span className="mono" style={{ color: 'var(--amber-dim)' }}>{item.step}</span>
                <h3
                  className="mt-2 font-semibold"
                  style={{ color: 'var(--text-primary)', fontSize: '1.125rem', letterSpacing: '-0.02em' }}
                >
                  {item.title}
                </h3>
                <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ MOBILE FEATURES — visible only on small screens ━━ */}
      <section className="lg:hidden" style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="px-6 py-16">
          <span className="mono" style={{ color: 'var(--amber)' }}>◆ Features</span>
          <div className="mt-6 space-y-6">
            {[
              { label: "01", title: "Quick creation", desc: "Add tasks with a title and optional description." },
              { label: "02", title: "Clean interface", desc: "Distraction-free design for focused work." },
              { label: "03", title: "Secure & private", desc: "Your data is encrypted and only accessible to you." },
            ].map((item, i) => (
              <div
                key={i}
                className="pb-6"
                style={{ borderBottom: '1px solid var(--rule)' }}
              >
                <span className="mono" style={{ color: 'var(--amber-dim)' }}>{item.label}</span>
                <h3 className="mt-1 font-semibold" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {item.title}
                </h3>
                <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ CTA — Left-aligned, minimal ━━ */}
      <section style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="px-6 lg:px-10 py-16 max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="display" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Stay organized.
              <br />
              <span style={{ color: 'var(--amber)' }}>Stay productive.</span>
            </h2>
            <p className="mt-4" style={{ color: 'var(--text-muted)', maxWidth: '28rem', lineHeight: '1.7' }}>
              Planixa helps you manage tasks efficiently and focus on what matters most.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="btn-primary">
                Start Free Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━ FOOTER — Minimal ruled ━━ */}
      <footer
        className="py-8 px-6 lg:px-10"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <span className="mono">
          © {new Date().getFullYear()} Planixa
        </span>
      </footer>
    </div>
  );
}
