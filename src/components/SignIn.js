import React from "react";
import "./SignIn.css";

const SignIn = ({ onLogin }) => {
  return (
    <div className="signin-container">
      <div className="signin-box">
        <h2>Homeless Code에 오신 것을 환영합니다</h2>
        <p>임시 로그인 버튼을 눌러 시작하세요</p>
        <button className="signin-button" onClick={onLogin}>
          임시 로그인
        </button>
      </div>
    </div>
  );
};

export default SignIn;
