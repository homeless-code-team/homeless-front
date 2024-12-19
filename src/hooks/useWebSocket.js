import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (channelId, onMessageReceived) => {
  const client = useRef(null);

  useEffect(() => {
    // STOMP 클라이언트 설정
    client.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8181/ws"), // Spring 서버의 웹소켓 엔드포인트
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 10000, // 재연결 딜레이 설정 (10초)
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 시 콜백
    client.current.onConnect = () => {
      console.log("Connected to WebSocket");

      // 기존 구독 해제 (필요 시)
      if (client.current.subscriptions) {
        Object.keys(client.current.subscriptions).forEach((sub) =>
          client.current.unsubscribe(sub)
        );
      }

      // 채널별 구독
      client.current.subscribe(`/topic/public/rooms/${channelId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("수신된 메시지:", receivedMessage); // 디버깅용 로그
        onMessageReceived(receivedMessage);
      });
    };

    // 에러 처리
    client.current.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    // 웹소켓 연결 시작
    client.current.activate();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, [channelId]);

  // 메시지 전송 함수
  const sendMessage = (message) => {
    if (client.current && client.current.connected) {
      try {
        client.current.publish({
          destination: `/app/rooms/${channelId}/send`,
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("WebSocket is not connected. Message not sent.");
    }
  };

  return { sendMessage };
};

export default useWebSocket;
