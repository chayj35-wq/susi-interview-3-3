# -*- coding: utf-8 -*-
"""
학생 추가/재생성 스크립트
사용법: tools 폴더 안에서 `python3 generate.py` 실행
  → students 배열에 학생을 추가/수정한 뒤 실행하면
    site/students/<번호>/index.html 이 새로 생성됩니다.
  → assets/config.js 의 students 배열에도 같은 학생을 추가해야
    메인 목록(index.html)에 카드가 나타납니다.

  ⚠️ 폴더 이름은 번호만 사용합니다(한글 이름 X). GitHub 웹 업로드
  화면이 한글이 포함된 폴더 이름을 거부하기 때문입니다("Invalid
  directory name characters" 오류). 학생 이름은 폴더 안 index.html
  내용과 config.js에는 그대로 한글로 들어가므로 화면에는 정상적으로
  한글 이름이 보입니다.
"""
import os

SITE = os.path.join(os.path.dirname(__file__), "..")

# 여기에 학생을 추가/수정하세요 (번호는 2자리 문자열, 예: "25")
students = [
    ("01", "강지영"), ("02", "김가은"), ("03", "김규림"), ("04", "김다은"),
    ("05", "김리나"), ("06", "김예서"), ("07", "김은수"), ("08", "김은지"),
    ("09", "박서현"), ("10", "박태후"), ("11", "박효빈"), ("12", "송은채"),
    ("13", "이다빈"), ("14", "이소정"), ("15", "이수진"), ("16", "이연우"),
    ("17", "이윤건"), ("18", "이은비"), ("19", "정다빈"), ("20", "정예근"),
    ("21", "정하린"), ("22", "조은수"), ("23", "최진환"), ("24", "홍윤아"),
]

with open(os.path.join(os.path.dirname(__file__), "_student_template.html"), encoding="utf-8") as f:
    template = f.read()


def university_block(i):
    return f'''<div class="uni-block">
          <span class="uni-num">카드 {i}</span>
          <div class="uni-grid">
            <div class="field"><label>대학명</label><input type="text" id="uni-name-{i}"></div>
            <div class="field"><label>학과(모집단위)</label><input type="text" id="uni-dept-{i}"></div>
          </div>
          <div class="field"><label>학과 인재상<span class="sub">대학·학과 홈페이지에서 조사</span></label><textarea id="uni-ideal-{i}"></textarea></div>
          <div class="field"><label>커리큘럼 특징</label><textarea id="uni-curri-{i}"></textarea></div>
          <div class="field"><label>교수님 전공·특색 (대표 교수 2~3인)</label><textarea id="uni-prof-{i}"></textarea></div>
          <div class="field" style="margin-bottom:0"><label>이 학과에 끌리는 이유</label><textarea id="uni-why-{i}"></textarea></div>
        </div>'''


uni_blocks_html = "\n        ".join(university_block(i) for i in range(1, 7))

count = 0
for no, name in students:
    folder = os.path.join(SITE, "students", no)
    os.makedirs(folder, exist_ok=True)
    html = (
        template.replace("##NAME##", name)
        .replace("##NO_INT##", str(int(no)))
        .replace("##NO##", no)
        .replace("##UNIVERSITY_BLOCKS##", uni_blocks_html)
    )
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    count += 1

print(f"generated {count} student pages")
