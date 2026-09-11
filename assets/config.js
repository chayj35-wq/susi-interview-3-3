/* ============================================================
   설정 파일 — 이 파일 하나만 고치면 사이트 전체에 반영됩니다.
   ============================================================ */

const SITE_CONFIG = {
  title: "홍익디자인고 3-3 수시 면접전형 준비",
  classLabel: "3학년 3반",
  adminName: "차윤정 (3학년 3반 담임)",

  // ── ⓪ 입장 비밀번호 ─────────────────────────────────────────
  // 학생들에게만 알려줄 공용 비밀번호를 여기에 적어주세요.
  // ⚠️ 이건 진짜 보안이 아니라 "가벼운 문단속"입니다 — 페이지 소스를
  // 볼 줄 아는 사람은 이 값을 그대로 볼 수 있어요. 검색엔진 노출을
  // 막고, 링크를 모르는 외부인이 우연히 들어오는 것을 막는 용도입니다.
  sitePassword: "2633",

  // 관리자(admin) 페이지는 학생 전체의 응답이 그대로 보이는 곳이라
  // 위 학생용 비밀번호와는 "다른", 선생님만 아는 별도 비밀번호를 쓰세요.
  adminPassword: "2633admin",

  // ── ① 구글 폼 연결 정보 ─────────────────────────────────────
  // 아래 안내대로 구글 폼을 만든 뒤, formResponse 주소와 각 문항의
  // entry.XXXXXXXXX 값을 여기에 붙여넣으세요. (README.md 참고)
  formActionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSePX3W27_CvLioJvj_zAZxnUwrZEBTOd9XkxpHGAZsooCnH6g/formResponse",

  entry: {
    classNo: "entry.520981666",       // 반
    studentNo: "entry.58548689",      // 번호
    name: "entry.549351344",          // 이름
    concept: "entry.425819989",       // 나만의 컨셉 키워드
    intro: "entry.1501743933",        // 1분 자기소개 스크립트
    motivationCommon: "entry.2119801020", // 지원동기(공통)
    careerPlan: "entry.346911685",    // 진로계획
    whySpecialized: "entry.1760163716",// 특성화고 선택 이유
    interestTopic: "entry.1791515769", // 관심 이슈·작가
    universityResearch: "entry.610755099", // 지원 대학 조사 (6개 블록 취합)
    qna: "entry.435927409",           // 예상 질문·답변 (취합)
  },

  // ── ② 관리자(담임) 응답 현황 보기 ───────────────────────────
  // 구글 폼의 '응답' 탭 → 스프레드시트로 보기 → 공유(링크가 있는 모든
  // 사용자: 뷰어 또는 편집자)로 설정한 뒤, 그 시트의 /edit 링크를
  // 아래에 붙여넣으면 admin/index.html에서 전체 응답을 한눈에 볼 수
  // 있습니다. 이 페이지는 학생 전체 응답이 그대로 보이므로 절대
  // 공개 링크로 학생들에게 공유하지 마세요. (README.md 주의사항 참고)
  adminSheetEmbedUrl: "https://docs.google.com/spreadsheets/d/1UMtAFEm17kTDrZjtS1SmdtOkQUffviW_JKIEtgv-jWk/edit",

  // ── ③ 학생 명단 (3학년 3반, 번호순) ─────────────────────────
  // password: 학생 개인 페이지(준비노트)를 열 때 추가로 필요한 "본인 확인
  // 비밀번호"입니다. 반 전체 입장 비밀번호(sitePassword)를 알아도 이 값을
  // 모르면 그 학생의 개인 페이지는 열 수 없습니다 — 같은 반 친구끼리
  // 서로의 페이지를 못 보게 막는 용도입니다. 각자에게 본인 번호만
  // 알려주듯 1:1로 안내해주세요(단체 공지 금지). 원하면 자유롭게 바꿔도
  // 됩니다.
  students: [
    { no: "01", name: "강지영", password: "5616" },
    { no: "02", name: "김가은", password: "4399" },
    { no: "03", name: "김규림", password: "9027" },
    { no: "04", name: "김다은", password: "2732" },
    { no: "05", name: "김리나", password: "5071" },
    { no: "06", name: "김예서", password: "3877" },
    { no: "07", name: "김은수", password: "4878" },
    { no: "08", name: "김은지", password: "2951" },
    { no: "09", name: "박서현", password: "7867" },
    { no: "10", name: "박태후", password: "6987" },
    { no: "11", name: "박효빈", password: "4546" },
    { no: "12", name: "송은채", password: "4959" },
    { no: "13", name: "이다빈", password: "9308" },
    { no: "14", name: "이소정", password: "6206" },
    { no: "15", name: "이수진", password: "5018" },
    { no: "16", name: "이연우", password: "1425" },
    { no: "17", name: "이윤건", password: "8151" },
    { no: "18", name: "이은비", password: "9727" },
    { no: "19", name: "정다빈", password: "1313" },
    { no: "20", name: "정예근", password: "6422" },
    { no: "21", name: "정하린", password: "8535" },
    { no: "22", name: "조은수", password: "6019" },
    { no: "23", name: "최진환", password: "5320" },
    { no: "24", name: "홍윤아", password: "0454" },
  ],
};
