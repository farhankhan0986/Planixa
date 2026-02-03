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
    }, 400); // typing speed

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="relative min-h-screen">
      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl text-center"
        >
          <h1 className="text-5xl sm:text-6xl font-semibold text-gradient leading-tight">
            Organize Your Tasks with <br />
            <span className="text-7xl font-semibold">
              <span className="text-gradient transition">"{displayedText}"</span>
              <span className="ml-1 animate-pulse ">|</span>
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400">
            A simple and powerful task management platform to help you organize
            your work, track progress, and stay focused.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg font-medium bg-linear-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110 transition"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-white/15 text-zinc-200 hover:bg-white/5 transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center text-zinc-200 mb-16"
          >
            Why Planixa?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Simple Task Creation",
                desc: "Create tasks quickly with titles and descriptions that keep everything clear.",
              },
              {
                title: "Clean & Focused Interface",
                desc: "A distraction-free design that helps you stay productive without overwhelm.",
              },
              {
                title: "Secure & Private",
                desc: "Your data is protected and accessible only to you.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6"
              >
                <h3 className="text-lg font-medium text-zinc-200 mb-2">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-zinc-200 mb-12 text-center">
            How It Works
          </h2>

          <div className="space-y-10">
            {[
              {
                step: "01",
                title: "Create Tasks",
                desc: "Add tasks with titles and optional descriptions to capture your work.",
              },
              {
                step: "02",
                title: "Edit & Manage",
                desc: "Update, edit, or delete tasks as your priorities change.",
              },
              {
                step: "03",
                title: "Track Progress",
                desc: "View all your tasks in one place and stay organized every day.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <span className="text-emerald-400 font-mono text-sm">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-zinc-200">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-semibold text-gradient mb-6">
            Stay Organized. Stay Productive.
          </h2>
          <p className="text-zinc-400 mb-10">
            Planixa helps you manage your tasks efficiently and focus on what
            matters most.
          </p>

          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg font-medium bg-linear-to-r from-emerald-500 to-amber-500 text-black hover:brightness-110 transition"
          >
            Start Free Today
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Planixa. All rights reserved.
      </footer>
    </div>
  );
}
