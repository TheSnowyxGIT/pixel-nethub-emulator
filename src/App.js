import React from "react";
import { useEffect } from "react";
import Screen from "./components/screen";
import "./tailwind.css";

import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
  const screenRef = React.useRef(null);
  const [screenConnected, setScreenConnected] = React.useState(false);

  useEffect(() => {
    let closeRequested = false;
    let reconnectIntervalId = null;
    let ws;

    const connect = () => {
      // eslint-disable-next-line no-undef
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Connected to the WebSocket server");
        setScreenConnected(true);
        clearReconnectInterval();
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const blob = event.data;
          const buffer = await blob.arrayBuffer();
          screenRef.current?.applyBuffer(buffer);
        } else {
          const { width, height } = JSON.parse(event.data);
          if (width && height) {
            screenRef.current?.changeResolution(width, height);
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error observed:", error);
        attemptReconnect();
      };

      ws.onclose = () => {
        console.log("Disconnected from the WebSocket server");
        setScreenConnected(false);
        attemptReconnect();
      };
    };

    const attemptReconnect = () => {
      if (!reconnectIntervalId && !closeRequested) {
        reconnectIntervalId = setInterval(() => connect(), 10000);
      }
    };

    const clearReconnectInterval = () => {
      if (reconnectIntervalId) {
        clearInterval(reconnectIntervalId);
        reconnectIntervalId = null;
      }
    };

    connect();

    // Clean up on unmount
    return () => {
      closeRequested = true;
      clearReconnectInterval();
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl">Screen Visualizer</h1>
      {screenConnected ? (
        <div className="mx-16 w-full h-[600px]">
          <Screen
            ref={screenRef}
            className="h-full"
            resolution={{ width: 32, height: 8 }}
          />
        </div>
      ) : (
        <span className="text-red-500">No IoT device connected!</span>
      )}
    </main>
  );
}

export default App;
