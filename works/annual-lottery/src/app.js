function getInitialData() {
  return {
    gameConf: V_BONUS_CONF,
    gameProcess: {
      curRun: 0,
      hitCount: 0,
      title: V_BONUS_CONF.start.title,
      subtitle: V_BONUS_CONF.start.subtitle,
      status: 'INITIAL' // INITIAL | READY | RUNNING | STOP | BREAK | OVER
    },
    candidates: V_BONUS_NAMES.slice(),
    curLuckyNames: [],
    historyRecords: [], // 中奖纪录
    lastBreakRecordIndex: null, // 颁奖间歇的上次结束位置+1
    randomIndexes: [],
    randomTimer: null,
    isAudioPause: false, // 仅音乐暂停
    extraDialog: {
      visible: false,
      form: {
        title: '附加轮抽奖',
        gift: '',
        count: 1
      }
    },
    exportDialog: {
      visible: false
    }
  };
}

function getExtraRun(title, subtitle, count) {
  return [
    {
      title: title || '附加轮抽奖',
      subtitle: subtitle || '',
      count: count || 1
    },
    {
      isBreak: true, // 颁奖间歇
      title: '颁奖时间',
      subtitle: '恭喜以下获奖观众'
    }
  ]
}

// key for localStorage
const STORAGE_KEY = 'V_BONUS_STORE';

new Vue({
  el: '#app',
  data: function() {
    return getInitialData();
  },
  computed: {
    runLength: function() {
      return (this.gameConf.runs || []).length;
    },
    gameStatus: function() {
      return this.gameProcess.status;
    },
    gameBtnText: function() {
      switch(this.gameProcess.status) {
        case 'READY':
          return '开始';
        case 'RUNNING':
          return '停止';
        case 'STOP':
        case 'BREAK':
          return '继续';
        default:
          return '按一下';
      }
    },
    audioSrc: function() {
      const dir = './media';
      switch(this.gameProcess.status) {
        case 'READY':
        case 'RUNNING':
          return dir + '/running.mp3';
        case 'STOP':
          return dir + '/stop.mp3';
        case 'BREAK':
          return dir + '/break.mp3';
        default:
          return dir + '/background.mp3';
      }
    },
    // 颁奖时该显示的前几轮中奖纪录
    breakHistoryRecords: function() {
      const lastIndex = this.lastBreakRecordIndex || 0;
      const res = this.historyRecords.slice(lastIndex);
      this.lastBreakRecordIndex = this.historyRecords.length;
      return res;
    }
  },
  watch: {
    isAudioPause(val) {
      const $audio = this.$refs.audio;
      if ($audio) {
        val ? $audio.pause() : $audio.play();
      }
    }
  },
  methods: {
    next: function() {
      // 防双击 防误触
      this._lastActionTime = this._lastActionTime || 0;
      if (new Date().getTime() - this._lastActionTime < 1000) {
        // 1秒内不得连续操作
        return;
      }
      this._lastActionTime = new Date().getTime();

      // sync 强制音乐开启
      this.isAudioPause = false;

      const process = this.gameProcess;
      // judge current status
      if (process.status === 'READY') {
        this.startRandom();
        this.gameProcess.status = 'RUNNING';

      } else if (process.status === 'RUNNING') {
        this.stopRandom();
        this.gameProcess.status = 'STOP';

      } else {
        // INITIAL | STOP | BREAK
        if (this.gameProcess.curRun >= this.runLength) {
          this.gameProcess.title = V_BONUS_CONF.end.title;
          this.gameProcess.subtitle = V_BONUS_CONF.end.subtitle;
          this.gameProcess.hitCount = 0;
          this.gameProcess.status = 'OVER';
          return;
        }
        // read next run info
        const runConf = this.gameConf.runs[this.gameProcess.curRun];

        this.gameProcess.title = runConf.title;
        this.gameProcess.subtitle = runConf.subtitle;
        this.gameProcess.hitCount = runConf.count || 0;
        this.gameProcess.status = runConf.isBreak ? 'BREAK' : 'READY';
      }

      // DON'T forget BREAK
      if (process.status === 'STOP' || process.status === 'BREAK') {
        // for next run
        this.gameProcess.curRun++;
      }

      // fix button always active
      this.$refs.action && this.$refs.action.$el.blur();

      // current status
      console.log(this.gameProcess.status);

      // sync localStorage
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$data));
    },

    reset: function() {
      this.$msgbox({
        title: '数据重置',
        message: '重置后将清空当前中奖历史，确定要重置吗？',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(function(action) {
        if (action === 'confirm') {
          // clear localStorage
          window.localStorage.removeItem(STORAGE_KEY);
          // reload
          window.location.href = window.location.href;
        }
      });
      // avoid triggering by keyboard
      this.$refs.reset && this.$refs.reset.$el.blur();
    },

    // 再来一轮，可配置
    addExtraRun: function() {
      // todo form.validate() max=30
      const form = this.extraDialog.form;
      const conf = getExtraRun(form.title, form.gift, form.count);
      this.gameConf.runs = this.gameConf.runs.concat(conf || []);
      this.extraDialog.visible = false;

      // game is continue
      this.next();
    },

    startRandom: function() {
      const that = this;
      const length = this.gameProcess.hitCount;
      this.randomTimer = setInterval(function() {
        that.randomIndexes = V_BONUS_UTIL.randomArray(length, {
          min: 0,
          max: that.candidates.length - 1
        });
      }, 100);
    },

    stopRandom: function() {
      const that = this;
      this.randomTimer && clearInterval(this.randomTimer);
      this.randomTimer = null;

      // make a temp copy
      this.curLuckyNames = this.randomIndexes.map(function(v) {
        return that.candidates[v];
      });

      // save to local
      this.addRecord(Object.assign({}, this.gameProcess), this.curLuckyNames);

      // remove lucky names
      this.shrinkCandidates();
    },

    addRecord: function(runInfo, luckyNames) {
      this.historyRecords.push({
        title: runInfo.title,
        subtitle: runInfo.subtitle,
        luckyNames: luckyNames
      });
    },

    // 总名单中移除已中奖者
    shrinkCandidates: function() {
      const that = this;
      const indexes = this.randomIndexes.sort(function(a, b) {
        return a - b;
      }).reverse();

      indexes.forEach(function(v) {
        let res = that.candidates.splice(v, 1);
      });
      this.randomIndexes = [];
      console.log(this.candidates.length);
    },

    // 缓存恢复检测
    detectRestore: function() {
      const that = this;
      let store = window.localStorage.getItem(STORAGE_KEY);
      if (!store) { return; }

      try {
        store = JSON.parse(store);
      } catch (e) {
        console.error('缓存数据解析错误');
      }

      this.$msgbox({
        title: '注意',
        message: '检测到缓存中有抽奖记录，是否恢复到之前的数据？',
        showCancelButton: true,
        confirmButtonText: '恢复',
        cancelButtonText: '开始新一轮'
      }).then(function(action) {
        if (action === 'confirm') {
          // restore from store
          for (let key in store) {
            if (that.hasOwnProperty(key) && store.hasOwnProperty(key)) {
              that[key] = store[key];
            }
          }
          // 不巧前一次在 running 时退出
          if (that.gameProcess.status === 'RUNNING') {
            that.startRandom();
          }
        }
      }).catch(function() {
        // clear localStorage
        window.localStorage.removeItem(STORAGE_KEY);
      });
    }
  },

  mounted: function() {
    const that = this;
    document.addEventListener('keyup', function(event) {
      // todo 抽奖状态防误触
      // exclusive modal
      if (document.querySelector('body > .v-modal')) {
        return;
      }
      // triggered by SPACE or ENTER
      if (event.keyCode === 13 || event.keyCode === 32) {
        that.next();
      }
    });

    window.addEventListener('blur', function() {
      that.isAudioPause = true;
      // that.$refs.audio && that.$refs.audio.pause();
    });
    window.addEventListener('focus', function() {
      that.isAudioPause = false;
      // that.$refs.audio && that.$refs.audio.play();
    });

    this.detectRestore();
  }
});
