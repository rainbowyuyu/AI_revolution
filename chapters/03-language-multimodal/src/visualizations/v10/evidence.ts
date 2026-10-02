// Saved outputs from experiments/run_mechanism_experiments.py; computed 2026-09-30.
export const attentionEvidence = {
  "tokens": [
    "红伞",
    "靠在",
    "蓝色",
    "门边"
  ],
  "Q": [
    [
      1.0,
      0.0
    ],
    [
      0.0,
      1.0
    ],
    [
      1.0,
      1.0
    ],
    [
      2.0,
      1.0
    ]
  ],
  "K": [
    [
      1.0,
      1.0
    ],
    [
      2.0,
      0.0
    ],
    [
      0.0,
      2.0
    ],
    [
      1.0,
      -1.0
    ]
  ],
  "V": [
    [
      1.0,
      0.0
    ],
    [
      0.0,
      1.0
    ],
    [
      2.0,
      1.0
    ],
    [
      -1.0,
      2.0
    ]
  ],
  "scores": [
    [
      0.7071067811865475,
      1.414213562373095,
      0.0,
      0.7071067811865475
    ],
    [
      0.7071067811865475,
      0.0,
      1.414213562373095,
      -0.7071067811865475
    ],
    [
      1.414213562373095,
      1.414213562373095,
      1.414213562373095,
      0.0
    ],
    [
      2.1213203435596424,
      2.82842712474619,
      1.414213562373095,
      0.7071067811865475
    ]
  ],
  "maskedScores": [
    [
      0.7071067811865475,
      null,
      null,
      null
    ],
    [
      0.7071067811865475,
      0.0,
      null,
      null
    ],
    [
      1.414213562373095,
      1.414213562373095,
      1.414213562373095,
      null
    ],
    [
      2.1213203435596424,
      2.82842712474619,
      1.414213562373095,
      0.7071067811865475
    ]
  ],
  "weights": [
    [
      1.0,
      0.0,
      0.0,
      0.0
    ],
    [
      0.6697615493266569,
      0.3302384506733431,
      0.0,
      0.0
    ],
    [
      0.3333333333333333,
      0.3333333333333333,
      0.3333333333333333,
      0.0
    ],
    [
      0.26565361202674675,
      0.5387760704802101,
      0.13098547884644676,
      0.06458483864659637
    ]
  ],
  "output": [
    [
      1.0,
      0.0
    ],
    [
      0.6697615493266569,
      0.3302384506733431
    ],
    [
      1.0,
      0.6666666666666666
    ],
    [
      0.46303973107304386,
      0.7989312266198496
    ]
  ],
  "futureWeightsZero": true,
  "rowSums": [
    1.0,
    1.0,
    1.0,
    1.0
  ],
  "note": "Hand chosen Q/K/V; exact computed outputs; weights are not learned semantic explanations."
};
export const tokenEvidence = {
  "type": "character_BPE_teaching_implementation",
  "merges": [
    {
      "step": 0,
      "pair": [
        "红",
        "伞"
      ],
      "count": 12,
      "exampleBefore": [
        "雨",
        "后",
        "的",
        "红",
        "伞",
        "靠",
        "在",
        "蓝",
        "色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后",
        "的",
        "红伞",
        "靠",
        "在",
        "蓝",
        "色",
        "门",
        "边",
        "。"
      ]
    },
    {
      "step": 1,
      "pair": [
        "蓝",
        "色"
      ],
      "count": 9,
      "exampleBefore": [
        "雨",
        "后",
        "的",
        "红伞",
        "靠",
        "在",
        "蓝",
        "色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后",
        "的",
        "红伞",
        "靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ]
    },
    {
      "step": 2,
      "pair": [
        "后",
        "的"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后",
        "的",
        "红伞",
        "靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后的",
        "红伞",
        "靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ]
    },
    {
      "step": 3,
      "pair": [
        "红伞",
        "靠"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后的",
        "红伞",
        "靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后的",
        "红伞靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ]
    },
    {
      "step": 4,
      "pair": [
        "红伞靠",
        "在"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后的",
        "红伞靠",
        "在",
        "蓝色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色",
        "门",
        "边",
        "。"
      ]
    },
    {
      "step": 5,
      "pair": [
        "蓝色",
        "门"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色",
        "门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色门",
        "边",
        "。"
      ]
    },
    {
      "step": 6,
      "pair": [
        "边",
        "。"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色门",
        "边",
        "。"
      ],
      "exampleAfter": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 7,
      "pair": [
        "雨",
        "后的"
      ],
      "count": 6,
      "exampleBefore": [
        "雨",
        "后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 8,
      "pair": [
        "了",
        "细"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 9,
      "pair": [
        "了细",
        "雨"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 10,
      "pair": [
        "了细雨",
        "。"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 11,
      "pair": [
        "住",
        "了细雨。"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 12,
      "pair": [
        "地",
        "面"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    },
    {
      "step": 13,
      "pair": [
        "地面",
        "映"
      ],
      "count": 3,
      "exampleBefore": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "exampleAfter": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ]
    }
  ],
  "vocabulary": [
    "。",
    "了",
    "了细",
    "了细雨",
    "了细雨。",
    "伞",
    "住",
    "住了细雨。",
    "后",
    "后的",
    "在",
    "地",
    "地面",
    "地面映",
    "挡",
    "放",
    "旁",
    "映",
    "的",
    "着",
    "红",
    "红伞",
    "红伞靠",
    "红伞靠在",
    "细",
    "色",
    "蓝",
    "蓝色",
    "蓝色门",
    "边",
    "边。",
    "门",
    "雨",
    "雨后的",
    "靠",
    "面"
  ],
  "examples": [
    {
      "text": "雨后的红伞靠在蓝色门边。",
      "tokens": [
        "雨后的",
        "红伞靠在",
        "蓝色门",
        "边。"
      ],
      "ids": [
        33,
        23,
        28,
        30
      ],
      "roundTrip": true
    },
    {
      "text": "蓝色的门旁放着红伞。",
      "tokens": [
        "蓝色",
        "的",
        "门",
        "旁",
        "放",
        "着",
        "红伞",
        "。"
      ],
      "ids": [
        27,
        18,
        31,
        16,
        15,
        19,
        21,
        0
      ],
      "roundTrip": true
    }
  ],
  "note": "Small corpus learned merges, not a commercial model tokenizer."
};
export const nextTokenEvidence = {
  "method": "character_trigram_with_backoff",
  "maxContextCharacters": 2,
  "smoothing": 0.1,
  "vocabulary": [
    "<EOS>",
    "。",
    "亮",
    "伞",
    "光",
    "分",
    "十",
    "后",
    "吹",
    "在",
    "地",
    "墙",
    "处",
    "微",
    "新",
    "有",
    "桌",
    "气",
    "水",
    "清",
    "灯",
    "的",
    "空",
    "窗",
    "红",
    "蓝",
    "起",
    "轻",
    "边",
    "过",
    "还",
    "远",
    "门",
    "雨",
    "靠",
    "面",
    "风",
    "黄",
    "黑",
    "，"
  ],
  "trainCount": 51,
  "testCount": 13,
  "split": "enumerated combinations, index mod 5 == 0 held out",
  "metrics": {
    "unigram": {
      "meanNLL": 3.4509605611277547,
      "perplexity": 31.53066489811738,
      "predictedTokens": 234
    },
    "trigram": {
      "meanNLL": 0.5781930003906346,
      "perplexity": 1.782813974176668,
      "predictedTokens": 234
    }
  },
  "contexts": [
    {
      "prefix": "雨后的红",
      "context": "的红",
      "orderUsed": 2,
      "count": 12,
      "distribution": [
        {
          "token": "伞",
          "probability": 0.7562500000000001,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "边",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.006250000000000001,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.006250000000000001,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的红伞",
      "context": "红伞",
      "orderUsed": 2,
      "count": 12,
      "distribution": [
        {
          "token": "靠",
          "probability": 0.75625,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "边",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.00625,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.00625,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的红伞靠",
      "context": "伞靠",
      "orderUsed": 2,
      "count": 51,
      "distribution": [
        {
          "token": "在",
          "probability": 0.9290909090909091,
          "count": 51
        },
        {
          "token": "<EOS>",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "边",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.0018181818181818182,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的红伞靠在",
      "context": "靠在",
      "orderUsed": 2,
      "count": 51,
      "distribution": [
        {
          "token": "墙",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "窗",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "门",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "桌",
          "probability": 0.22,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "边",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.0018181818181818182,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的红伞靠在门",
      "context": "在门",
      "orderUsed": 2,
      "count": 13,
      "distribution": [
        {
          "token": "边",
          "probability": 0.7705882352941176,
          "count": 13
        },
        {
          "token": "<EOS>",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.0058823529411764705,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的红伞靠在门边，",
      "context": "边，",
      "orderUsed": 2,
      "count": 51,
      "distribution": [
        {
          "token": "微",
          "probability": 0.23818181818181813,
          "count": 13
        },
        {
          "token": "空",
          "probability": 0.23818181818181813,
          "count": 13
        },
        {
          "token": "远",
          "probability": 0.23818181818181813,
          "count": 13
        },
        {
          "token": "地",
          "probability": 0.21999999999999995,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "边",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.0018181818181818177,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.0018181818181818177,
          "count": 0
        }
      ]
    },
    {
      "prefix": "雨后的青色木门",
      "context": "门",
      "orderUsed": 1,
      "count": 13,
      "distribution": [
        {
          "token": "边",
          "probability": 0.7705882352941176,
          "count": 13
        },
        {
          "token": "<EOS>",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "光",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "分",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "十",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "后",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "吹",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "在",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "地",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "墙",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "处",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "微",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "新",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "有",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "桌",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "气",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "水",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "清",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "灯",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "的",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "空",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "窗",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "红",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "蓝",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "起",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "轻",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "过",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "还",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "远",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "门",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "雨",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "靠",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "面",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "风",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "黄",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "黑",
          "probability": 0.0058823529411764705,
          "count": 0
        },
        {
          "token": "，",
          "probability": 0.0058823529411764705,
          "count": 0
        }
      ]
    }
  ],
  "temperatureExamples": [
    {
      "temperature": 0.5,
      "distribution": [
        {
          "token": "墙",
          "probability": 0.2593863361547763,
          "count": 13
        },
        {
          "token": "窗",
          "probability": 0.2593863361547763,
          "count": 13
        },
        {
          "token": "门",
          "probability": 0.2593863361547763,
          "count": 13
        },
        {
          "token": "桌",
          "probability": 0.2212968561064087,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 1.5114873035066504e-05,
          "count": 0
        },
        {
          "token": "。",
          "probability": 1.5114873035066504e-05,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 1.5114873035066504e-05,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 1.5114873035066504e-05,
          "count": 0
        }
      ],
      "seed": 12,
      "text": "雨后的红伞靠在墙边，微风轻轻吹过。"
    },
    {
      "temperature": 1,
      "distribution": [
        {
          "token": "墙",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "窗",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "门",
          "probability": 0.2381818181818182,
          "count": 13
        },
        {
          "token": "桌",
          "probability": 0.22,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.0018181818181818182,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.0018181818181818182,
          "count": 0
        }
      ],
      "seed": 12,
      "text": "雨后的红伞靠地面还有雨水。窗新。"
    },
    {
      "temperature": 1.5,
      "distribution": [
        {
          "token": "墙",
          "probability": 0.18712130775843805,
          "count": 13
        },
        {
          "token": "窗",
          "probability": 0.18712130775843805,
          "count": 13
        },
        {
          "token": "门",
          "probability": 0.18712130775843805,
          "count": 13
        },
        {
          "token": "桌",
          "probability": 0.17747313749227503,
          "count": 12
        },
        {
          "token": "<EOS>",
          "probability": 0.007254526089789189,
          "count": 0
        },
        {
          "token": "。",
          "probability": 0.007254526089789189,
          "count": 0
        },
        {
          "token": "亮",
          "probability": 0.007254526089789189,
          "count": 0
        },
        {
          "token": "伞",
          "probability": 0.007254526089789189,
          "count": 0
        }
      ],
      "seed": 12,
      "text": "雨后的红伞靠靠在墙边，地面雨空气地面还。"
    }
  ],
  "note": "Synthetic controlled corpus, count baseline; not a Transformer, not an open-world language benchmark."
};
