/* ============================================================
   간단한 입장 비밀번호 화면
   ⚠️ 진짜 서버 보안이 아닙니다. 페이지 소스를 볼 줄 아는 사람은
   assets/config.js 에서 비밀번호를 그대로 볼 수 있습니다.
   검색엔진 노출을 막고, 링크를 몰라도 우연히 들어오는 외부인을
   막는 "가벼운 문단속" 용도로만 사용하세요.

   3단계 잠금:
   1) 관리자 페이지(admin) — SITE_CONFIG.adminPassword
   2) 그 외 모든 페이지 — SITE_CONFIG.sitePassword (반 공용 비밀번호)
   3) 학생 개인 페이지(students/<번호>/)는 2)를 통과한 뒤에도
      그 학생의 SITE_CONFIG.students[].password를 추가로 확인합니다.
      → 같은 반 친구가 공용 비밀번호를 알아도 서로의 개인 페이지는
      열 수 없습니다.
   ============================================================ */
(function () {
  var isAdmin = document.body.dataset.gate === "admin";
  var studentNo = null;
  if (!isAdmin) {
    var m = location.pathname.match(/\/students\/(\d+)\/?/);
    if (m) studentNo = m[1];
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function storageSet(key) {
    try {
      localStorage.setItem(key, "1");
    } catch (e) {}
  }

  function siteUnlocked() {
    return storageGet(isAdmin ? "admin_unlocked_v1" : "site_unlocked_v1") === "1";
  }
  function studentUnlocked() {
    return storageGet("student_unlocked_v1_" + studentNo) === "1";
  }

  function reveal() {
    document.documentElement.classList.remove("gate-lock");
    var overlay = document.getElementById("gate-overlay");
    if (overlay) overlay.remove();
  }

  function findStudentPassword() {
    if (typeof SITE_CONFIG === "undefined" || !Array.isArray(SITE_CONFIG.students)) return null;
    for (var i = 0; i < SITE_CONFIG.students.length; i++) {
      if (SITE_CONFIG.students[i].no === studentNo) return SITE_CONFIG.students[i].password || null;
    }
    return null;
  }

  function showPrompt(title, sub, check, onSuccess) {
    var overlay = document.createElement("div");
    overlay.id = "gate-overlay";
    overlay.innerHTML =
      '<div class="gate-card">' +
      '<div class="gate-title">🔒 ' + title + "</div>" +
      '<p class="gate-sub">' + sub + "</p>" +
      '<input type="password" id="gate-input" inputmode="text" autocomplete="off" placeholder="비밀번호">' +
      '<button type="button" id="gate-submit" class="btn btn-primary" style="width:100%;margin-top:12px;">입장하기</button>' +
      '<div id="gate-error" class="gate-error"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var input = document.getElementById("gate-input");
    var err = document.getElementById("gate-error");

    function attempt() {
      if (check(input.value)) {
        overlay.remove();
        onSuccess();
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

  function afterSiteGate() {
    // 학생 개인 페이지가 아니면 여기서 끝
    if (!studentNo) {
      reveal();
      return;
    }
    if (studentUnlocked()) {
      reveal();
      return;
    }
    var pw = findStudentPassword();
    var notConfigured = !pw;
    if (notConfigured) {
      console.warn("[gate] 이 학생의 개인 비밀번호가 아직 config.js에 설정되지 않아 잠금 없이 통과합니다.");
      storageSet("student_unlocked_v1_" + studentNo);
      reveal();
      return;
    }
    showPrompt(
      (typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG.title : ""),
      "본인 확인 비밀번호를 입력해주세요. (다른 학생은 이 페이지를 열 수 없어요)",
      function (val) { return val === pw; },
      function () {
        storageSet("student_unlocked_v1_" + studentNo);
        reveal();
      }
    );
  }

  function startSiteGate() {
    var pw = typeof SITE_CONFIG !== "undefined" ? (isAdmin ? SITE_CONFIG.adminPassword : SITE_CONFIG.sitePassword) : "";
    var notConfiguredYet = !pw || pw.indexOf("여기에_") === 0;
    if (notConfiguredYet) {
      // 비밀번호가 아직 설정되지 않았으면 그냥 통과시킴(설정 전 미리보기용)
      console.warn("[gate] 비밀번호가 아직 config.js에 설정되지 않아 잠금 없이 통과합니다.");
      storageSet(isAdmin ? "admin_unlocked_v1" : "site_unlocked_v1");
      afterSiteGate();
      return;
    }
    showPrompt(
      (typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG.title : "") + (isAdmin ? " · 관리자" : ""),
      isAdmin ? "선생님만 아는 관리자 비밀번호를 입력해주세요." : "선생님께 받은 비밀번호를 입력하면 들어갈 수 있어요.",
      function (val) { return val === pw; },
      function () {
        storageSet(isAdmin ? "admin_unlocked_v1" : "site_unlocked_v1");
        afterSiteGate();
      }
    );
  }

  function fixFooterText() {
    var OLD = "관리자: 차윤정 (3학년 3반 담임)";
    var NEW = "페이지 제작 및 관리자 : 차윤정(3학년 3반 담임)";
    document.querySelectorAll("footer .wrap").forEach(function (el) {
      if (el.innerHTML.indexOf(OLD) !== -1) {
        el.innerHTML = el.innerHTML.split(OLD).join(NEW);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fixFooterText();
    if (siteUnlocked()) {
      afterSiteGate();
    } else {
      startSiteGate();
    }
  });
})();
