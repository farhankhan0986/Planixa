"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-6 py-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="glass p-8 space-y-6">
          <h1 className="text-3xl font-semibold text-gradient">
            Terms of Service
          </h1>

          <p className="text-zinc-400 text-sm">
            Last updated: February 3, 2026
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              1. Acceptance of Terms
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              By accessing or using Planixa, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              2. Use of the Service
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You agree to use the service only for lawful purposes and in a way
              that does not infringe the rights of others or restrict their use
              of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              3. User Accounts
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              4. User Content
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You retain ownership of the tasks and content you create. By using
              the service, you grant permission for your content to be stored
              and processed solely for providing the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              5. Service Availability
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The service is provided on an “as is” and “as available” basis. We
              do not guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              6. Termination
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We reserve the right to suspend or terminate access to the service
              at any time if these terms are violated.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              7. Limitation of Liability
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Planixa shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">
              8. Changes to These Terms
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              These terms may be updated from time to time. Continued use of the
              service after changes indicates acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-zinc-200">9. Contact</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact the project maintainer.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
