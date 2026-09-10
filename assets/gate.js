/* ============================================================
   간단한 입장 비밀번호 화면
   ⚠️ 진짜 서버 보안이 아닙니다. 페이지 소스를 볼 줄 아는 사람은
   assets/config.js 에서 비밀번호를 그대로 볼 수 있습니다.
   검색엔진 노출을 막고, 링크를 몰라도 우연히 들어오는 외부인을
   막는 "가벼운 문단속" 용도로만 사용하세요.
   ============================================================ */
(function () {
  var isAdmin = document.body.dataset.gate === "admin";
  var STORAGE_KEY = isAdmin ? "admin_unlocked_v1" : "site_unlocked_v1";

  function isUnlocked() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    document.documentElement.classList.remove("gate-lock");
    var overlay = document.getElementById("gate-overlay");
    if (overlay) overlay.remove();
  }

  function showGate() {
    var overlay = document.createElement("div");
    overlay.id = "gate-overlay";
    overlay.innerHTML =
      '<div class="gate-card">' +
      '<div class="gate-title">🔒 ' + (typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG.title : "") + (isAdmin ? " · 관리자" : "") + "</div>" +
      '<p class="gate-sub">' + (isAdmin ? "선생님만 아는 관리자 비밀번호를 입력해주세요." : "선생님께 받은 비밀번호를 입력하면 들어갈 수 있어요.") + "</p>" +
      '<input type="password" id="gate-input" inputmode="text" autocomplete="off" placeholder="비밀번호">' +
      '<button type="button" id="gate-submit" class="btn btn-primary" style="width:100%;margin-top:12px;">입장하기</button>' +
      '<div id="gate-error" class="gate-error"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var input = document.getElementById("gate-input");
    var err = document.getElementById("gate-error");

    function attempt() {
      var pw = typeof SITE_CONFIG !== "undefined" ? (isAdmin ? SITE_CONFIG.adminPassword : SITE_CONFIG.sitePassword) : "";
      var notConfiguredYet = !pw || pw.indexOf("여기에_") === 0;
      if (notConfiguredYet) {
        // 비밀번호가 아직 설정되지 않았으면 그냥 통과시킴(설정 전 미리보기용)
        console.warn("[gate] 비밀번호가 아직 config.js에 설정되지 않아 잠금 없이 통과합니다.");
        unlock();
        return;
      }
      if (input.value === pw) {
        unlock();
      } else {
        err.textContent = "비밀번호가 올바르지 않아요. 다시 확인해주세요.";
        input.value = "";
        input.focus();
      }
    }

    document.getElementById("gate-submit").addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") attempt();
    });
    setTimeout(function () {
      input.focus();
    }, 60);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (isUnlocked()) {
      document.documentElement.classList.remove("gate-lock");
    } else {
      showGate();
    }
  });
})();
