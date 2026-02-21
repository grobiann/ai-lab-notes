---
title: "Transformer 어텐션 메커니즘 직접 구현해보기"
description: "수식만 봐서는 감이 오지 않던 Self-Attention을 NumPy로 직접 구현하며 이해한 과정을 정리합니다."
pubDate: 2026-02-18
tags: ["AI", "Deep Learning", "Python"]
---

논문을 읽고 강의를 들었는데도 Attention이 머릿속에서 잘 정리되지 않았다. 결국 NumPy로 직접 구현해보기로 했다.

## Self-Attention이 하는 일

입력 시퀀스의 각 토큰이 다른 토큰들과 얼마나 관련 있는지를 계산해서, 그 관계를 반영한 새로운 표현을 만드는 것이다.

수식으로 보면:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

## NumPy 구현

```python
import numpy as np

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.shape[-1]
    # (seq_len, seq_len) 어텐션 스코어
    scores = Q @ K.T / np.sqrt(d_k)
    # 소프트맥스로 확률 변환
    weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)
    return weights @ V

# 간단한 테스트
seq_len, d_model = 4, 8
Q = np.random.randn(seq_len, d_model)
K = np.random.randn(seq_len, d_model)
V = np.random.randn(seq_len, d_model)

output = scaled_dot_product_attention(Q, K, V)
print(output.shape)  # (4, 8)
```

## 직접 구현해보고 얻은 것

- `sqrt(d_k)`로 나누는 이유: 차원이 커질수록 내적값이 커져서 softmax 기울기가 소실되기 때문이다.
- Q, K, V가 왜 3개인지: Query로 검색하고, Key와 대조하고, Value를 가져오는 구조다. 마치 DB 조회 같다.
- 실제 Multi-Head Attention은 이걸 여러 번 병렬로 수행하고 concatenate한다.

수식만 볼 때보다 확실히 이해가 깊어졌다. 다음엔 Multi-Head Attention까지 구현해볼 예정.
