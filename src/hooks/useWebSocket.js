import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (serverId, channelId, onMessageReceived) => {
  const client = useRef(null);
  const currentSubscription = useRef(null);

  const handleMessage = useCallback((message) => {
    const receivedMessage = JSON.parse(message.body);
    onMessageReceived(receivedMessage);
  }, [onMessageReceived]);

  useEffect(() => {
    if (!serverId || !channelId) return;

    const connect = () => {
      if (!client.current) {
        client.current = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8181/ws"),
          onConnect: () => {
            if (currentSubscription.current) {
              currentSubscription.current.unsubscribe();
            }

            currentSubscription.current = client.current.subscribe(
              `/topic/${serverId}/${channelId}`,
              handleMessage
            );
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        client.current.activate();
      } else if (client.current.connected) {
        if (currentSubscription.current) {
          currentSubscription.current.unsubscribe();
        }
        currentSubscription.current = client.current.subscribe(
          `/topic/${serverId}/${channelId}`,
          handleMessage
        );
      }
    };

    connect();

    return () => {
      if (currentSubscription.current) {
        currentSubscription.current.unsubscribe();
      }
    };
  }, [serverId, channelId, handleMessage]);

  useEffect(() => {
    return () => {
      if (client.current) {
        client.current.deactivate();
        client.current = null;
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (client.current?.connected) {
      client.current.publish({
        destination: `/app/${serverId}/${channelId}/send`,
        body: JSON.stringify(message)
      });
    }
  };

  return { sendMessage };
};

export default useWebSocket;
