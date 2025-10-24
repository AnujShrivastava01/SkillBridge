import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: 'Home', href: '#home' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'About', href: '#about' },
      { name: 'Contact', href: '#contact' },
    ],
    followUs: [
      { name: 'GitHub', href: '#', icon: '🐙' },
      { name: 'Twitter', href: '#', icon: '𝕏' },
    ],
  };

  const teamMembers = [
    { name: 'Anuj Shrivastava', linkedin: 'https://www.linkedin.com/in/anujshrivastava1/' },
    { name: 'Divyansh Agrawal', linkedin: 'https://www.linkedin.com/in/divyansh-agrawal-4556a0299/' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  <span className="text-white">Skill</span>
                  <span className="text-cyan-400">Bridge</span>
                </h1>
              </div>
              <p className="text-slate-300 mb-6 max-w-md text-sm">
                Peer-to-peer learning simplified. Connect with fellow students, share knowledge, and grow together in your learning journey.
              </p>
            </div>

            {/* Mobile Layout - Two columns on mobile */}
            <div className="grid grid-cols-2 gap-8 md:contents">
              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">QUICK LINKS</h3>
                <ul className="space-y-2">
                  {footerLinks.quickLinks.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-slate-300 hover:text-white transition-colors duration-200 text-left text-sm"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow Us - Right side on mobile */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">FOLLOW US</h3>
                <ul className="space-y-2">
                  {footerLinks.followUs.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-slate-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <span className="text-sm">{link.icon}</span>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact - Right side on mobile */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">CONTACT</h3>
                <ul className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <li key={index}>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {member.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-center items-center relative">
            <p className="text-slate-400 text-sm text-center">
              © {currentYear} SkillBridge. All Rights Reserved.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors duration-200 mt-4 md:mt-0 md:absolute md:right-0"
              aria-label="Scroll to top"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
