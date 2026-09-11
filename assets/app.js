/* ============================================================
   공통 스크립트 — 학생 입력 폼 제출 & 관리자 시트 확대/축소
   ============================================================ */

function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ---------- 예상 질문 & 답변: 행 추가/삭제 ---------- */
function addQnaRow(question, answer) {
  const list = document.getElementById("qna-list");
  if (!list) return;
  const idx = list.children.length + 1;
  const row = document.createElement("div");
  row.className = "qna-row";
  row.innerHTML = `
    <button type="button" class="remove-btn" aria-label="삭제">✕ 삭제</button>
    <div class="field">
      <label>예상 질문 ${idx}</label>
      <input type="text" class="qna-q" placeholder="예: 이 활동에서 가장 어려웠던 점은?" value="${question || ""}">
    </div>
    <div class="field" style="margin-bottom:0">
      <label>답변 키워드</label>
      <textarea class="qna-a" placeholder="두괄식으로: 결론 → 근거 → 배운 점">${answer || ""}</textarea>
    </div>`;
  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    renumberQna();
  });
  list.appendChild(row);
}

function renumberQna() {
  const list = document.getElementById("qna-list");
  if (!list) return;
  [...list.children].forEach((row, i) => {
    row.querySelector("label").textContent = `예상 질문 ${i + 1}`;
  });
}

/* ---------- 임시 저장(이 브라우저에만 저장, 제출과 별개) ---------- */
function draftKey(studentNo) {
  return `susi_draft_${studentNo}`;
}

function collectDraftData() {
  const form = document.getElementById("student-form");
  if (!form) return null;
  const fields = {};
  form.querySelectorAll("input[id], textarea[id]").forEach((el) => {
    if (el.id.startsWith("f-") || el.id.startsWith("uni-")) {
      fields[el.id] = el.value;
    }
  });
  const qna = [];
  document.querySelectorAll("#qna-list .qna-row").forEach((row) => {
    qna.push({
      q: row.querySelector(".qna-q")?.value || "",
      a: row.querySelector(".qna-a")?.value || "",
    });
  });
  return { fields, qna, savedAt: new Date().toISOString() };
}

function saveDraft(studentNo) {
  const data = collectDraftData();
  if (!data) return;
  try {
    localStorage.setItem(draftKey(studentNo), JSON.stringify(data));
    showToast("💾 이 브라우저에 저장했어요. (다른 기기·브라우저에서는 안 보여요 — 최종 제출은 꼭 제출하기 버튼으로!)");
  } catch (e) {
    showToast("저장에 실패했어요. 브라우저 저장공간을 확인해주세요.");
  }
}

function loadDraft(studentNo) {
  let raw;
  try {
    raw = localStorage.getItem(draftKey(studentNo));
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return false;
  }
  if (data.fields) {
    Object.entries(data.fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });
  }
  if (Array.isArray(data.qna) && data.qna.length) {
    const list = document.getElementById("qna-list");
    if (list) list.innerHTML = "";
    data.qna.forEach((item) => addQnaRow(item.q, item.a));
  }
  return true;
}

/* ---------- 나만의 면접문제 카드 (학생 개인 페이지) ---------- */
function collectMyQuestions() {
  const out = [];
  document.querySelectorAll("#qna-list .qna-row").forEach((row) => {
    const q = row.querySelector(".qna-q")?.value.trim() || "";
    const a = row.querySelector(".qna-a")?.value.trim() || "";
    if (q) out.push({ q, a });
  });
  return out;
}

let myqKeyHandler = null;

function closeMyQuestionsModal() {
  const overlay = document.getElementById("myq-overlay");
  if (overlay) overlay.remove();
  if (myqKeyHandler) {
    document.removeEventListener("keydown", myqKeyHandler);
    myqKeyHandler = null;
  }
}

function openMyQuestionsModal() {
  closeMyQuestionsModal();
  const items = collectMyQuestions();
  const overlay = document.createElement("div");
  overlay.className = "myq-overlay";
  overlay.id = "myq-overlay";

  if (items.length === 0) {
    overlay.innerHTML =
      '<div class="myq-modal">' +
      '<button type="button" class="myq-close" id="myq-close" aria-label="닫기">✕</button>' +
      '<div class="myq-title">🎯 나만의 면접문제</div>' +
      '<p class="myq-empty">아직 3번 "예상 질문 &amp; 답변 준비"에 입력한 질문이 없어요.<br>아래로 내려가 질문을 먼저 적어보세요.</p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.getElementById("myq-close").addEventListener("click", closeMyQuestionsModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMyQuestionsModal();
    });
    myqKeyHandler = (e) => {
      if (e.key === "Escape") closeMyQuestionsModal();
    };
    document.addEventListener("keydown", myqKeyHandler);
    return;
  }

  overlay.innerHTML =
    '<div class="myq-modal">' +
    '<button type="button" class="myq-close" id="myq-close" aria-label="닫기">✕</button>' +
    '<div class="myq-title">🎯 나만의 면접문제</div>' +
    '<p class="myq-sub">내가 3번에 적어둔 예상 질문을 카드로 연습해보세요.</p>' +
    '<div class="myq-stage"><div class="myq-card" id="myq-card"></div></div>' +
    '<div class="myq-nav">' +
    '<button type="button" class="myq-arrow" id="myq-prev" aria-label="이전 질문">←</button>' +
    '<span class="myq-counter" id="myq-counter">1 / ' + items.length + "</span>" +
    '<button type="button" class="myq-arrow" id="myq-next" aria-label="다음 질문">→</button>' +
    "</div>" +
    '<button type="button" class="btn btn-ghost btn-sm" id="myq-toggle-answer" style="display:flex;margin:14px auto 0;">내 답변 메모 보기</button>' +
    '<div class="myq-answer" id="myq-answer" hidden></div>' +
    "</div>";
  document.body.appendChild(overlay);

  let pos = 0;
  let showingAnswer = false;
  const cardEl = document.getElementById("myq-card");
  const counterEl = document.getElementById("myq-counter");
  const prevBtn = document.getElementById("myq-prev");
  const nextBtn = document.getElementById("myq-next");
  const answerEl = document.getElementById("myq-answer");
  const toggleBtn = document.getElementById("myq-toggle-answer");

  function render() {
    cardEl.textContent = items[pos].q;
    counterEl.textContent = `${pos + 1} / ${items.length}`;
    prevBtn.disabled = pos === 0;
    nextBtn.disabled = pos === items.length - 1;
    answerEl.textContent = items[pos].a || "(적어둔 답변 메모가 없어요)";
    showingAnswer = false;
    answerEl.hidden = true;
    toggleBtn.textContent = "내 답변 메모 보기";
  }

  function go(delta) {
    const next = pos + delta;
    if (next < 0 || next >= items.length) return;
    pos = next;
    render();
  }

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  toggleBtn.addEventListener("click", () => {
    showingAnswer = !showingAnswer;
    answerEl.hidden = !showingAnswer;
    toggleBtn.textContent = showingAnswer ? "답변 메모 숨기기" : "내 답변 메모 보기";
  });
  document.getElementById("myq-close").addEventListener("click", closeMyQuestionsModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMyQuestionsModal();
  });

  myqKeyHandler = (e) => {
    if (e.key === "Escape") closeMyQuestionsModal();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };
  document.addEventListener("keydown", myqKeyHandler);

  render();
}

/* ---------- 학생 입력 폼 초기화 ---------- */
function initStudentForm(studentNo, studentName) {
  const form = document.getElementById("student-form");
  if (!form) return;

  // 학생 정보 표시(참고용, 실제 제출값은 페이지에 고정된 번호/이름을 사용)
  const label = document.getElementById("student-label");
  if (label) label.textContent = `${SITE_CONFIG.classLabel} ${parseInt(studentNo, 10)}번 ${studentName}`;

  // 질문 추가 버튼
  const addBtn = document.getElementById("add-qna");
  if (addBtn) addBtn.addEventListener("click", () => addQnaRow());

  // 이 브라우저에 저장된 내용이 있으면 불러오기
  const hadDraft = loadDraft(studentNo);

  // 불러온 내용이 없을 때만 기본 2줄 제공
  if (document.getElementById("qna-list") && document.getElementById("qna-list").children.length === 0) {
    addQnaRow();
    addQnaRow();
  }

  // "나만의 면접문제" 버튼 — 1번 섹션(자기소개 & 나만의 컨셉) 바로 위에 추가
  if (!document.getElementById("myq-open-btn")) {
    const firstPanel = form.querySelector(".panel");
    if (firstPanel) {
      const myqBtn = document.createElement("button");
      myqBtn.type = "button";
      myqBtn.id = "myq-open-btn";
      myqBtn.className = "btn btn-ghost";
      myqBtn.style.cssText = "display:flex;width:max-content;margin:0 auto 24px;";
      myqBtn.textContent = "🎯 나만의 면접문제";
      myqBtn.addEventListener("click", openMyQuestionsModal);
      firstPanel.parentNode.insertBefore(myqBtn, firstPanel);
    }
  }

  // "저장하기" 버튼을 "제출하기" 버튼 앞에 추가
  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn && !document.getElementById("save-btn")) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "save-btn";
    saveBtn.className = "btn btn-ghost";
    saveBtn.textContent = "저장하기";
    saveBtn.addEventListener("click", () => saveDraft(studentNo));
    submitBtn.parentNode.insertBefore(saveBtn, submitBtn);
  }

  if (hadDraft) {
    showToast("이 브라우저에 저장해둔 내용을 불러왔어요.");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitToGoogleForm(studentNo, studentName);
  });
}

function collectUniversityResearch() {
  let out = [];
  for (let i = 1; i <= 6; i++) {
    const get = (id) => (document.getElementById(id + i)?.value || "").trim();
    const name = get("uni-name-");
    const dept = get("uni-dept-");
    const ideal = get("uni-ideal-");
    const curriculum = get("uni-curri-");
    const prof = get("uni-prof-");
    const why = get("uni-why-");
    if (!name && !dept && !ideal && !curriculum && !prof && !why) continue;
    out.push(
      `[${i}] 대학: ${name || "-"} / 학과: ${dept || "-"}\n` +
      `  · 인재상: ${ideal || "-"}\n` +
      `  · 커리큘럼 특징: ${curriculum || "-"}\n` +
      `  · 교수님 전공·특색: ${prof || "-"}\n` +
      `  · 끌리는 이유: ${why || "-"}`
    );
  }
  return out.join("\n\n");
}

function collectQna() {
  const list = document.getElementById("qna-list");
  if (!list) return "";
  let out = [];
  [...list.children].forEach((row, i) => {
    const q = row.querySelector(".qna-q")?.value.trim();
    const a = row.querySelector(".qna-a")?.value.trim();
    if (!q && !a) return;
    out.push(`Q${i + 1}. ${q || "-"}\nA${i + 1}. ${a || "-"}`);
  });
  return out.join("\n\n");
}

function submitToGoogleForm(studentNo, studentName) {
  const cfg = SITE_CONFIG;
  const val = (id) => document.getElementById(id)?.value.trim() || "";

  const data = {
    [cfg.entry.classNo]: cfg.classLabel,
    [cfg.entry.studentNo]: parseInt(studentNo, 10),
    [cfg.entry.name]: studentName,
    [cfg.entry.concept]: val("f-concept"),
    [cfg.entry.intro]: val("f-intro"),
    [cfg.entry.motivationCommon]: val("f-motivation"),
    [cfg.entry.careerPlan]: val("f-career"),
    [cfg.entry.whySpecialized]: val("f-why-specialized"),
    [cfg.entry.interestTopic]: val("f-interest"),
    [cfg.entry.universityResearch]: collectUniversityResearch(),
    [cfg.entry.qna]: collectQna(),
  };

  if (cfg.formActionUrl.includes("여기에_본인_폼_ID")) {
    showToast("⚠️ 아직 구글 폼이 연결되지 않았어요. 선생님께 문의해주세요.");
    return;
  }

  // 숨김 iframe으로 전송 (페이지 이동 없이 제출)
  let iframe = document.getElementById("hidden-submit-frame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "hidden-submit-frame";
    iframe.name = "hidden-submit-frame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const tempForm = document.createElement("form");
  tempForm.action = cfg.formActionUrl;
  tempForm.method = "POST";
  tempForm.target = "hidden-submit-frame";

  Object.entries(data).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    tempForm.appendChild(input);
  });

  document.body.appendChild(tempForm);
  tempForm.submit();
  setTimeout(() => tempForm.remove(), 500);

  const btn = document.getElementById("submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "제출 완료 ✓";
  }
  showToast("제출됐어요. 수정하려면 다시 작성 후 제출 버튼을 눌러주세요.");
}

/* ---------- 관리자: 시트 확대/축소 ---------- */
function initAdminSheet() {
  const iframe = document.getElementById("sheet-frame");
  const wrap = document.getElementById("sheet-frame-wrap");
  const slider = document.getElementById("zoom-range");
  const label = document.getElementById("zoom-label");
  if (!iframe || !SITE_CONFIG.adminSheetEmbedUrl) return;

  iframe.src = SITE_CONFIG.adminSheetEmbedUrl;

  const applyZoom = (pct) => {
    const scale = pct / 100;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.width = 100 / scale + "%";
    iframe.style.height = 78 / scale + "vh";
    if (label) label.textContent = pct + "%";
  };

  if (slider) {
    slider.addEventListener("input", (e) => applyZoom(e.target.value));
    applyZoom(slider.value);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (body.dataset.role === "admin") initAdminSheet();
});
