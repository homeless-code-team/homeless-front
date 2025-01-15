import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (channelId, onMessageReceived) => {
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
    if (!channelId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const connect = () => {
      if (!client.current) {
        const socket = new SockJS(
          `${process.env.REACT_APP_API_BASE_URL}/chat-service/ws`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        client.current = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          onConnect: () => {
            if (currentSubscription.current) {
              currentSubscription.current.unsubscribe();
            }

            currentSubscription.current = client.current.subscribe(
              `/exchange/chat.exchange/chat.channel.${channelId}`,
              handleMessage,
              {
                Authorization: `Bearer ${token}`,
              }
            );
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        client.current.activate();
      }
    };

    connect();

    return () => {
      if (currentSubscription.current) {
        currentSubscription.current.unsubscribe();
      }
      if (client.current) {
        client.current.deactivate();
        client.current = null;
      }
    };
  }, [channelId, handleMessage]);

  const sendMessage = (message) => {
    if (client.current?.connected) {
      const token = localStorage.getItem("token");
      client.current.publish({
        destination: `/pub/chat.message.${channelId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });
    }
  };

  const deleteMessage = (chatId) => {
    if (client.current?.connected) {
      const token = localStorage.getItem("token");
      client.current.publish({
        destination: `/pub/chat.message.delete.${channelId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: chatId,
      });
    } else {
      console.error("WebSocket이 연결되어 있지 않습니다.");
    }
  };

  return { sendMessage, deleteMessage };
};

export default useWebSocket;
