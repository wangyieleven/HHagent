document.addEventListener('DOMContentLoaded', function () {
  fetch('/portal/oauth/currentUser', {
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error(`网络错误：${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data && data.code === 0 && data.data) {
        const loginLink = document.querySelector('.login');
        if (loginLink) {
          loginLink.textContent = '个人中心';
        }
        const userTtile = document.querySelector('#userTtile');
        if (userTtile) {
          userTtile.innerHTML = '欢迎您，' + data.data.realName;
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('tokenId', data.data.tokenId); // 存入 token
        sessionStorage.setItem('userName', data.data.realName || '');

        // 新增：把法人id和用户id存入localStorage
        if (data.data.roleId) {
          localStorage.setItem('IdList', data.data.roleId); // 法人id，逗号拼接
        }
        if (data.data.userId) {
          localStorage.setItem('userId', data.data.userId); // 当前用户id
          sessionStorage.setItem('userId', data.data.userId);
        } else {
          sessionStorage.removeItem('userId');
        }
      }else{
        const loginLink = document.querySelector('.login');
        if (loginLink) {
          loginLink.innerHTML = '登 录 <img src="../images/v5_login_icon.png">';
        }
        // 清缓存
        localStorage.removeItem('isLoggedIn');
        // localStorage.removeItem('tokenId');
        // localStorage.removeItem('IdList');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
      }
      // const userList = data.data.roleId ||;
      // console.log('userList',userList);
    })
    .catch(err => {
      console.error('获取用户信息失败:', err);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('tokenId');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
    });
});
