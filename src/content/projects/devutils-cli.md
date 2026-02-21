---
title: "DevUtils CLI"
description: "자주 쓰는 개발 작업을 빠르게 처리하는 커맨드라인 툴. Base64, JSON 포맷, 타임스탬프 변환 등을 터미널에서 바로 실행."
tags: ["TypeScript", "Node.js", "CLI"]
github: "https://github.com/grobiann/devutils-cli"
order: 2
---

## 프로젝트 소개

개발하다 보면 반복적으로 쓰는 소소한 유틸리티들이 있습니다. 브라우저 탭을 열어서 하기엔 번거롭고, 코드로 짜기엔 과한 작업들을 터미널에서 바로 처리하기 위해 만들었습니다.

## 기능

```bash
# Base64 인코딩/디코딩
devutils b64 encode "hello world"
devutils b64 decode "aGVsbG8gd29ybGQ="

# JSON 포맷팅
cat data.json | devutils json format

# Unix 타임스탬프 변환
devutils ts 1708000000
devutils ts now
```

## 기술 스택

- **TypeScript** + **Node.js**
- **Commander.js**: CLI 파싱
- **Zod**: 입력값 검증
