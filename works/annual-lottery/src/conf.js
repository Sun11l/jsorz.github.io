window.V_BONUS_CONF = (function() {
  // 颁奖间歇
  const BREAK_TIME = {
    isBreak: true,
    title: '颁奖时间',
    subtitle: '恭喜以下获奖观众'
  };

  return {
    start: {
      title: '抽奖啦',
      subtitle: '奖品多多 手气旺旺'
    },
    end: {
      title: '奖品送完啦',
      subtitle: '恭喜所有中奖观众'
    },
    runs: [
      {
        title: '第1轮抽奖',
        subtitle: 'WMF便携式果汁机',
        count: 10
      },
      BREAK_TIME,
      {
        title: '第2轮抽奖',
        subtitle: '小米头戴式耳机',
        count: 10
      },
      {
        title: '第2轮抽奖',
        subtitle: '膳魔师焖烧杯',
        count: 10
      },
      {
        title: '第2轮抽奖',
        subtitle: '小米电饭煲IH',
        count: 10
      },
      BREAK_TIME,
      {
        title: '第3轮抽奖',
        subtitle: '小米头戴式耳机',
        count: 10
      },
      {
        title: '第3轮抽奖',
        subtitle: '膳魔师焖烧杯',
        count: 10
      },
      {
        title: '第3轮抽奖',
        subtitle: '小米车载净化器',
        count: 10
      },
      BREAK_TIME,
      {
        title: '第4轮抽奖',
        subtitle: '小米电饭煲IH',
        count: 10
      },
      {
        title: '第4轮抽奖',
        subtitle: '小米车载净化器',
        count: 10
      },
      {
        title: '第4轮抽奖',
        subtitle: 'WMF便携式果汁机',
        count: 10
      },
      BREAK_TIME
    ]
  };
})();
