import React, { useEffect } from 'react';

const ChatBot: React.FC = () => {
  useEffect(() => {
    // Initialize Chatbase
    if (!(window as any).chatbase || (window as any).chatbase("getState") !== "initialized") {
      (window as any).chatbase = (...args: any[]) => {
        if (!(window as any).chatbase?.q) {
          ((window as any).chatbase).q = [];
        }
        ((window as any).chatbase.q).push(...args);
      };
      (window as any).chatbase = new Proxy((window as any).chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args: unknown[]) => target(prop, ...args);
        }
      });

      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "sP9CJWhwzez2Ue0OjChkF";
      script.setAttribute('data-domain', 'www.chatbase.co');
      document.body.appendChild(script);
    }
  }, []);

  return <div id="chatbase-bubble" />;
};

export default ChatBot;