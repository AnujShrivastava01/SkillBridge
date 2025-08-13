import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Preloader from "../components/Preloader";
import RequestFeed from "../components/RequestFeed";
import apiService from "../services/api";
import "./orbit-animations.css";

interface HelpRequest {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
    description: string;
    icon: string;
  };
  requester: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  urgency: "low" | "medium" | "high";
  estimatedDuration?: string;
  location?: string;
  isRemote: boolean;
  budgetMin?: number;
  budgetMax?: number;
  status: "open" | "in_progress" | "completed";
  createdAt: string;
}

const words = [
  { text: "Collaborate.", color: "#fff" },
  { text: "Learn.", color: "#fff" },
  { text: "Grow.", color: "gradient" },
];

function AnimatedHeroWords() {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"
  const [showIdx, setShowIdx] = useState(0);

  useEffect(() => {
    let timeout;
    if (phase === "in") {
      if (showIdx < words.length - 1) {
        timeout = setTimeout(() => setShowIdx((i) => i + 1), 400);
      } else {
        timeout = setTimeout(() => setPhase("hold"), 900);
      }
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("out"), 900);
    } else if (phase === "out") {
      timeout = setTimeout(() => {
        setShowIdx(0);
        setPhase("in");
      }, 600);
    }
    return () => clearTimeout(timeout);
  }, [phase, showIdx]);

  return (
    <h1 className="text-5xl lg:text-7xl font-bold mb-6 min-h-[7.5rem]">
      {words.map((word, idx) => {
        const style: React.CSSProperties = {
          opacity: 0,
          transform: "translateX(-40px)",
          transition: "opacity 0.6s, transform 0.6s",
          display: "block",
          minHeight: "1.2em",
        };
        if (phase === "in" && idx <= showIdx) {
          style.opacity = 1;
          style.transform = "translateX(0)";
        }
        if (phase === "hold") {
          style.opacity = 1;
          style.transform = "translateX(0)";
        }
        if (phase === "out") {
          style.opacity = 0;
          style.transform = "translateX(40px)";
        }
        if (word.color === "gradient") {
          style.background = "linear-gradient(to right, #22d3ee, #a78bfa)";
          style.WebkitBackgroundClip = "text";
          style.WebkitTextFillColor = "transparent";
        } else {
          style.color = word.color;
        }
        return (
          <span key={word.text} style={style}>
            {word.text}
          </span>
        );
      })}
    </h1>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRequests({ status: "open" });
      setRequests(data.slice(0, 6)); // Show only first 6 requests
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (request: HelpRequest) => {
    // Navigate to accept request page
    navigate("/accept-request");
  };

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {!isLoading && (
        <>
          <Navigation />

          {/* Hero Section */}
          <section
            id="home"
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <AnimatedHeroWords />
                  <p className="text-xl text-slate-300 mb-8">
                    Peer-to-peer learning simplified.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => navigate("/send-request")}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-4 px-8 rounded-lg hover:from-cyan-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3">
                      <span>Send Request</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => navigate("/accept-request")}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-8 rounded-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3">
                      <span>Help Others</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl">📚</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="py-20 bg-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  How It Works
                </h2>
                <p className="text-slate-300 text-lg">
                  Simple steps to collaborative learning
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: "➕",
                    title: "Submit Request",
                    description:
                      "Share what you need help with and let peers know your learning goals.",
                  },
                  {
                    icon: "📋",
                    title: "Browse Feed",
                    description:
                      "View live requests from fellow students in your learning community.",
                  },
                  {
                    icon: "🤝",
                    title: "Accept & Help",
                    description:
                      "Accept requests where you can help and connect with fellow learners.",
                  },
                  {
                    icon: "🎓",
                    title: "Learn Together",
                    description:
                      "Collaborate, share knowledge, and grow your skills together.",
                  },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="text-center flex flex-col items-center"
                    style={{
                      animation: `orbit 4s linear infinite`,
                      animationDelay: `${index * 0.7}s`,
                    }}
                  >
                    <div
                      className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
                      style={{
                        boxShadow: "0 0 24px 0 rgba(168,139,250,0.3)",
                        animation: `icon-orbit 4s linear infinite`,
                        animationDelay: `${index * 0.7}s`,
                      }}
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Live Request Feed */}
          <RequestFeed
            requests={requests}
            onAcceptRequest={handleAcceptRequest}
          />

          {/* About Section */}
          <section id="about" className="py-20 bg-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-6">
                    About SkillBridge
                  </h2>
                  <p className="text-slate-300 text-lg mb-8">
                    We believe learning is better when shared. SkillBridge
                    connects students within your college community, making it
                    easy to find help and offer assistance.
                  </p>

                  <div className="space-y-4">
                    {[
                      { icon: "⚡", label: "Fast Connections" },
                      { icon: "🛡️", label: "Secure Platform" },
                      { icon: "👥", label: "Collaborative Learning" },
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-2xl">{feature.icon}</div>
                        <span className="text-slate-300 font-medium">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-lg flex items-center justify-center text-2xl">
                        📚
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Join the community and start learning together
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/send-request")}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200">
                    Post a Request
                  </button>
                  <button
                    onClick={() => navigate("/accept-request")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
                    Help Others
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Index;
