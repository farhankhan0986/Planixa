"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const sections = [
    { num: "01", title: "Acceptance of Terms", body: "By accessing or using Planixa, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application." },
    { num: "02", title: "Use of the Service", body: "You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service." },
    { num: "03", title: "User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
    { num: "04", title: "User Content", body: "You retain ownership of the tasks and content you create. By using the service, you grant permission for your content to be stored and processed solely for providing the service." },
    { num: "05", title: "Service Availability", body: "The service is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted or error-free operation." },
    { num: "06", title: "Termination", body: "We reserve the right to suspend or terminate access to the service at any time if these terms are violated." },
    { num: "07", title: "Limitation of Liability", body: "Planixa shall not be liable for any indirect, incidental, or consequential damages arising from the use of the service." },
    { num: "08", title: "Changes to These Terms", body: "These terms may be updated from time to time. Continued use of the service after changes indicates acceptance of the updated terms." },
    { num: "09", title: "Contact", body: "If you have any questions about these Terms of Service, please contact the project maintainer." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 lg:px-10 py-10"
    >
      <div className="max-w-2xl">
        <h1 className="display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
          Terms of Service
        </h1>
        <span className="mono block mt-2" style={{ color: 'var(--text-faint)' }}>
          Last updated: February 3, 2026
        </span>

        <div className="rule mt-6 mb-8" />

        {sections.map((s) => (
          <section key={s.num} className="mb-8">
            <div className="flex items-baseline gap-3">
              <span className="mono" style={{ color: 'var(--amber-dim)' }}>{s.num}</span>
              <h2
                className="font-semibold"
                style={{ color: 'var(--text-primary)', fontSize: '1.125rem', letterSpacing: '-0.02em' }}
              >
                {s.title}
              </h2>
            </div>
            <p
              className="mt-2"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                paddingLeft: '2.25rem',
              }}
            >
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </motion.div>
  );
}
