---
title: "[Unity] PathOfExile 따라하기 - 던전생성 #1: 실내지역"
description: "매 플레이마다 새로운 실내 던전을 절차적으로 생성하는 방법. 타일·Room·던전 개념부터 8단계 생성 알고리즘까지 정리한다."
pubDate: 2025-01-10
tags: ["Unity", "C#", "절차적 생성", "PathOfExile 따라하기"]
---

![던전 생성 결과물](/ai-lab-notes/images/blog/poe-dungeon-1-1.png)

## 개요

게임 던전 제작의 여러 방법 중 절차적 생성을 활용합니다. Path of Exile은 "타일의 랜덤성"과 "던전 진행경로의 랜덤성"을 적용합니다.

- **타일 기반 생성**: 적은 리소스로 다양한 던전, 동일 머테리얼 사용으로 드로우콜 감소, 빠른 제작 시간
- **Layout 기반 생성**: 중요 오브젝트 배치 제어, 밸런스 관리 용이

**구성 요소**
- 타일: 정사각형 한 칸
- Room: 1x1~NxM 직사각형, 다수 타일로 구성
- 던전: 여러 Room의 그룹

## 타일

타일은 주변 타일과의 "연결관계"를 가집니다. 던전 타일은 인접한 벽 타일 정보를 포함합니다. 4개 방향(위, 아래, 좌, 우) 연결로 회전/플립 시 4가지 연결 패턴만 존재합니다. 타일 배치 시 이름/키가 아닌 연결관계로 결정되므로, 동일 연결관계의 모든 타일이 나올 수 있습니다.

![타일 연결관계 설명](/ai-lab-notes/images/blog/poe-dungeon-1-2.png)

## Room

Room은 타일의 연결관계만 정의하여 런타임에 동적으로 생성합니다. Unity Tilemap2D로 벽 위치를 설정하고, 초록색 점은 인접 Room과의 문 위치입니다. 벽 위치에 따라 랜덤 타일을 생성하며, 회전/플립 시 "Walkable 정보"를 수정합니다.

![Room 구조 설명](/ai-lab-notes/images/blog/poe-dungeon-1-3.png)

## 던전

다양한 크기의 Room들을 배치하여 생성합니다.

![던전 생성 알고리즘 흐름](/ai-lab-notes/images/blog/poe-dungeon-1-4.png)

**던전 생성 알고리즘**

1. 던전 크기 설정
2. 시작(1x1)과 종료(1x1) 위치 설정
3. 여백에 NxM 크기 Room 랜덤 배치
4. 각 Room의 통과 비용 설정
5. 최소 비용 경로 탐색
6. 경로 외 Room 제거
7. 경로 인접 Room 추가
8. Room 간 문 추가

![던전 생성 단계별 과정](/ai-lab-notes/images/blog/poe-dungeon-1-5.png)

![최종 던전 결과물](/ai-lab-notes/images/blog/poe-dungeon-1-6.png)

다음 편에서는 길, 강, 언덕이 있는 **야외지역 던전 생성**을 다룹니다.
