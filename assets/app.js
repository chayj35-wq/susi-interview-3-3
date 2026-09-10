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
  // 기본 2줄 제공
  if (document.getElementById("qna-list") && document.getElementById("qna-list").children.length === 0) {
    addQnaRow();
    addQnaRow();
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
