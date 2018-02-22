var util = {
  swap: function (arr, i1, i2) {
    if (Array.isArray(arr)) {
      let tmp = arr[i1];
      arr[i1] = arr[i2];
      arr[i2] = tmp;
    }
  },

  /**
   * 选取随机整数
   * @param {Number} min - 下限
   * @param {Number} max - 上限
   * @returns {Number} - 包含上下限端点的随机值
   */
  randomInt: function (min = 0, max = 100) {
    min = parseInt(min)
    max = parseInt(max)
    if (Number.isNaN(min) || Number.isNaN(max)) {
      throw Error('randomInt cannot accept non-number parameter');
    }
    if (max < min) {
      let tmp = min;
      min = max;
      max = tmp;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  },

  /**
   * 随机整数数组
   * @param {Number} length - 数组长度
   * @param {Object} config - 配置项
   *    @param {Number} min - 整数下限
   *    @param {Number} max - 整数上限
   *    @param {Boolean} duplicated - 是否允许重复
   * @returns {Array} - 给定长度的随机数据
   */
  randomArray: function (length, config) {
    length = +length;
    if (length <= 0) {
      return [];
    }

    config = config || {};
    let min = config.min || 0;
    let max = config.max || length - 1;
    let duplicated = config.duplicated || false;
    min = +min;
    max = +max;

    if (max < min) {
      let tmp = min;
      min = max;
      max = tmp;
    }

    // 以 [min, max] 作为候选区间
    let candidates = Array.apply(null, { length: max - min + 1 })
      .map(function (v, i) { return min + i; });

    let results = [];
    let i;
    while (length-- && candidates.length) {
      i = util.randomInt(0, candidates.length - 1);
      results.push(candidates[i]);
      // 不允许重复
      if (!duplicated) {
        candidates.splice(i, 1);
      }
    }
    return results;
  },

  /**
   * 将数组乱序（洗牌）
   * @param {Array} arr 给定一个数组
   * @returns {Array} - 乱序后的数组（原数组 is mutable）
   */
  // TODO 比全排列的结果少
  shuffleArray: function (arr) {
    if (!Array.isArray(arr) || arr.length <= 1) {
      return arr;
    }

    let rndIndex;
    for (let i = 1; i < arr.length; i++) {
      rndIndex = util.randomInt(i, arr.length - 1);
      util.swap(arr, i - 1, rndIndex);
    }
    return arr;
  }
};

window.V_BONUS_UTIL = util;
