import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (serverId, channelId, onMessageReceived) => {
  const client = useRef(null);
  const currentSubscription = useRef(null);

  const handleMessage = useCallback(
    (message) => {
      const receivedMessage = JSON.parse(message.body);
      onMessageReceived(receivedMessage);
    },
    [onMessageReceived]
  );

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
              `/topic/chats.ch.${channelId}`,
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
          `/topic/chats.ch.${channelId}`,
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
      console.log("WebSocket 클라이언트 상태:", {
        connected: client.current.connected,
        destination: `/pub/chats.ch.${channelId}`,
        message: message,
      });

      client.current.publish({
        destination: `/pub/chats.ch.${channelId}`,
        body: JSON.stringify(message),
      });

      console.log("WebSocket 메시지 발행 완료");
    } else {
      console.error("WebSocket이 연결되어 있지 않음");
    }
  };

  return { sendMessage };
};

export default useWebSocket;
