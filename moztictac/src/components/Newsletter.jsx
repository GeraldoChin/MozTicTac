import { useState } from "react";
import { GREEN } from "../data/constants";

/**
 * Newsletter — email subscription banner with success state.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="py-12" style={{ background: GREEN }}>
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-black text-white mb-1">Subscribe & Save 20%</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,.8)" }}>
          Get the latest deals and fashion updates delivered to your inbox.
        </p>

        {subscribed ? (
          <p className="text-white font-bold text-lg">🎉 Thanks for subscribing!</p>
        ) : (
          <div className="flex rounded overflow-hidden shadow-lg">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-sm outline-none text-gray-800 placeholder-gray-400 border-none"
            />
            <button
              onClick={() => email && setSubscribed(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 font-semibold text-sm border-none cursor-pointer transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        )}
      </div>
    </section>
  );
}