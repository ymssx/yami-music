export const ACCESS_TOKEN_KEY = 'steam_access_token';
export const REDIRECT_URI = window.location.origin + import.meta.env.BASE_URL;

// 模拟获取 OAuth 令牌的函数
export function getAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    return token;
  } else {
    // 如果没有找到 token，则进行授权流程
    initiateSteamOAuthFlow();
    return null;
  }
}

// 模拟初始化 OAuth 流程，用户通过授权后，token 会被存储在 localStorage 中
function initiateSteamOAuthFlow() {
  const oauthUrl = `https://steamcommunity.com/oauth/login?response_type=token&redirect_uri=${REDIRECT_URI}`;
  window.location.href = oauthUrl; // 重定向到 Steam OAuth 登录页面
}
