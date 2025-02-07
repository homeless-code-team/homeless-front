// 여기에서 axios 인스턴스를 생성하고,
// interceptor 기능을 활용하여, access token이 만료되었을 때 refresh token을 사용하여
// 새로운 access token을 발급받는 비동기 방식의 요청을 모듈화. (fetch는 interceptor 기능 x)
// axios 인스턴스는 token이 필요한 모든 요청에 활용 될 것입니다.
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Axios 인스턴스 생성
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

/*
Axios Interceptor는 요청 또는 응답이 처리되기 전에 실행되는 코드입니다.
요청을 수정하거나, 응답에 대한 결과 처리를 수행할 수 있습니다.
*/

// Request용 인터셉터 설정
// 인터셉터의 use함수는 매개값을 2개 받습니다. 둘 다 콜백 함수로 전달합니다.
// 1번째 콜백에는 정상 동작 로직을 작성
// 2번째 콜백에는 과정 중 에러가 발생할 경우 실행할 로직을 작성.
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 보내기 전에 일괄 처리해야 할 내용을 콜백 함수로 전달.
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// Response용 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => response, // 응답에 문제 없으면 그대로 응답 객체 리턴.

  async (error) => {
    console.log("response interceptor 동작함! 응답에 문제가 발생!");
    console.log(error);

    // 응답이 실패했는데, 토큰 재발급이 필요하지 않은 상황 (로그인을 애초에 하지 않음)
    // 밑에 로직이 실행되지 않도록 return
    if (error.response.data.message === "NO_LOGIN") {
      return Promise.reject(error);
    }

    // 원본 요청의 정보를 기억해 놓자 -> 새 토큰 발급 받아서 다시 보내야 되니까.
    const originalRequest = error.config;

    // 토큰 재발급 로직 작성
    // _retry의 값이 true라면 if문을 실행하지 마! -> 아까 했자나!
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("응답상태 401 발생! 토큰 재발급 필요!");

      // _retry 속성은 사용자 정의 속성입니다. 최초 요청에서는 존재하지 않습니다.
      // 만약 재요청 시에도 문제가 발생했다면 (refresh 만료 등),
      // 더 이상 똑같은 요청을 반복해서 무한 루프에 빠지지 않도록
      // 막아주는 역할을 합니다.
      originalRequest._retry = true;

      try {
        const userInfo = localStorage.getItem("userInfo");
        console.log("====================================");
        console.log(userInfo);
        console.log("====================================");
        const parsedUserInfo = JSON.parse(userInfo);
        console.log("====================================");
        console.log(parsedUserInfo);
        console.log("====================================");
        const id = parsedUserInfo.userId;
        console.log(id);

        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/refresh-token`,
          { id }
        );

        const token = res.data.data; // axios는 json() 안씁니다.
        localStorage.setItem("token", token); // 동일한 이름으로 토큰 담기 (덮어씀)
        const decoded = jwtDecode(token);

        const userInfos = {
          token,
          email: decoded.sub,
          userId: decoded.user_id,
          role: decoded.role,
          nickname: decoded.nickname,
        };

        localStorage.setItem("userInfos", JSON.stringify(userInfos));

        // 실패한 원본 요청 정보에서 Authorization의 값을 새 토큰으로 바꿔놓자.
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // axios 인스턴스의 기본 header Authorization도 새 토큰으로 바꿔놓자.
        axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;

        // axiosInstance를 사용하여 다시 한 번 원본 요청을 보내고, 응답값은 원래 호출한 곳으로 리턴.
        return axiosInstance(originalRequest);
      } catch (e) {
        console.log("인터셉터가 새토큰 요청했는데, rt가 만료됨!");
        // Refresh 토큰도 만료가 된 상황 (로그아웃이 된 것처럼 보여줘야 함.)
        // 재발급 요청도 거절당하면 인스턴스를 호출한 곳으로 에러 정보를 리턴.
        return Promise.reject(e);
      }
    }
  }
);

export default axiosInstance;
