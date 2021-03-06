// 关于画棋盘、棋子的
var context 
var screenWidth = 0
var chessBoards = []  //  1 白方（我方） 2 黑方（计算机或者是另一方）
var width = 0
var space = 0
var left = 0
var top = 0
// 关于判断逻辑的
var me = true
var wins = []
var myWin = []
var computerWin = []
var count = 0
var over = false

Page({

  data: {
    man_machine: true  // 判断是人机、人人
  },

  // 再来一局（把界面各种参数都清楚掉）
  oneMoreGame: function(e){
    me = true
    myWin = []
    computerWin = []
    over = false
    for (var i = 0; i < count; i++) {
      myWin[i] = 0;
      computerWin[i] = 0
    }
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 15; j++) {
        chessBoards[i][j] = 0
      }
    }
    this.drawChess(true)
  },

  // 切换成:人机 
  toMMachine: function(e){
    var that = this
    wx.showModal({
      title: '',
      content: '确定要放弃当前进度，并切换成人机模式吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res){
        if(res.confirm){
          // 确定
          that.setData({
            man_machine: !that.data.man_machine
          })
          that.oneMoreGame()
        }
      }
    })
  },

  // 切换成：人人
  toMMan: function(e){
    var that = this
    wx.showModal({
      title: '',
      content: '确定要放弃当前进度，并切换成人人模式吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          // 确定
          that.setData({
            man_machine: !that.data.man_machine
          })
          that.oneMoreGame()
        }
      }
    })
  },

  onLoad: function () {
    var that = this
    that.init()
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        screenWidth = res.screenWidth
        that.drawChess(true)
      },
    })
  },

  init: function(){
    // init chessboard
    for(var i = 0; i < 15; i++){
      chessBoards[i] = []
      for(var j = 0; j < 15; j++){
        chessBoards[i][j] = 0
      }
    }
    // init wins
    for(var i = 0; i < 15; i++){
      wins[i] = []
      for(var j = 0; j < 15; j++){
        wins[i][j] = []
      }
    }
    for(var i = 0; i < 15; i++){
      for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
          wins[i][j + k][count] = true
        }
        count++
      }
    }
    for(var i = 0; i < 11; i++){
      for(var j = 0; j < 15; j++){
        for(var k = 0; k < 5; k++){
          wins[i + k][j][count] = true
        }
        count++
      }
    }
    for(var i = 0; i < 11; i++){
      for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
          wins[i + k][j + k][count] = true
        }
        count++
      }
    }
    for(var i = 4; i < 15; i++){
      for(var j = 0; j < 11; j++){
        for(var k = 0; k < 5; k++){
          wins[i - k][j + k][count] = true
        }
        count++
      }
    }
    // init myWin computerWins
    for(var i = 0; i < count; i++){
      myWin[i] = 0;
      computerWin[i] = 0
    }

  },
  
  // 画棋盘
  drawChess: function(first){
    context = wx.createCanvasContext('chess')

    context.setStrokeStyle('#000000')
    context.setLineWidth(1)
    width = screenWidth * 0.9
    space = width / 14
    left = screenWidth * 0.05
    top = (400 - width) / 2
    for (var i = 0; i < 15; i++) {
      context.moveTo(left + i * space, 1 + top)
      context.lineTo(left + i * space, 1 + width + top)
      context.moveTo(left, 1 + i * space + top)
      context.lineTo(left + width, 1 + i * space + top)
    }

    context.stroke()

    if(first){
      context.draw()
    }
  },

  // 当前模式
  getMode: function(){
    return this.data.man_machine
  },

  // 用户点击棋盘：真人 下棋
  chess_tap: function(e){
    if (over || (!me && this.getMode() )){ // 说明现在该计算机下棋了或者比赛已经结束，点击无效
      return
    }
    
    // positionToXY
    var x = e.detail.x
    var y = e.detail.y - 50
    var i = Math.floor((x - left + space / 2) / space) 
    var j = Math.floor((y - top + space / 2) / space) 
    
    if(chessBoards[i][j] != 0){ // 如果这个位置已经有棋子了，返回
      return
    }
    chessBoards[i][j] = me ? 1 : 2;
    this.drawPiece() 
    if(this.getMode()){
      // 人机下棋，判断下棋方是否赢了
      for (var k = 0; k < count; k++) {
        if (wins[i][j][k]) {
          myWin[k]++
          computerWin[k] = 6
          if (myWin[k] == 5) {
            wx.showModal({
              title: '',
              content: '恭喜，你赢了',
            })
            over = true
            return
          }
        }
      }
    }else{
      // 人人下棋，判断某一方是否赢了
      var winArray = me ? myWin : computerWin;  // 即使是computerWin，其实是另一方
      var anotherWin = me ? computerWin : myWin;
      for(var k = 0; k < count; k++){
        if(wins[i][j][k]){
          winArray[k]++
          anotherWin[k] = 6
          if (winArray[k] == 5){
            wx.showModal({
              title: '',
              content: (me ? '白' : '黑') + '方获胜',
            })
            over = true
            return
          }
        }
      }
    }
    
    me = !me
    if(this.getMode()){
      this.computerAI() 
    }
  },

  // 机算法
  computerAI: function(){
    var max = 0
    var u = 0
    var v = 0
    var myScore = []
    var computerScore = []
    for(var i = 0; i < 15; i++){
      myScore[i] = []
      computerScore[i] = []
      for(var j = 0; j < 15; j++){
        myScore[i][j] = 0
        computerScore[i][j] = 0
      }
    }

    for(var i = 0; i < 15; i++){
      for(var j = 0; j < 15; j++){
        if(chessBoards[i][j] == 0){
          for(var k = 0; k < count; k++){
            if(wins[i][j][k]){
              switch(myWin[k]){
                case 1:
                  myScore[i][j] += 10;
                  break;
                case 2:
                  myScore[i][j] += 50;
                  break;
                case 3:
                  myScore[i][j] += 100;
                  break;
                case 4:
                  myScore[i][j] += 1000;
                  break;    
              }
              switch(computerWin[k]){
                case 1:
                  computerScore[i][j] += 12;
                  break;
                case 2:
                  computerScore[i][j] += 52;
                  break;
                case 3:
                  computerScore[i][j] += 120;
                  break;
                case 4:
                  computerScore[i][j] += 2000;
                  break;    
              }
            }
          }
          // 
          if(myScore[i][j] > max){
            max = myScore[i][j]
            u = i
            v = j
          }else if(myScore[i][j] == max){
            if(computerScore[i][j] > computerScore[u][v]){
              u = i
              v = j
            }
          }
          if (computerScore[i][j] > max) {
            max = computerScore[i][j]
            u = i
            v = j
          } else if (computerScore[i][j] == max) {
            if (myScore[i][j] > myScore[u][v]) {
              u = i
              v = j
            }
          }
        }
      }
    }

    chessBoards[u][v] = 2
    this.drawPiece()
    me = !me
    // 判断黑棋是否赢了
    for (var k = 0; k < count; k++) {
      if (wins[u][v][k]) {
        computerWin[k]++
        myWin[k] = 6
        if (computerWin[k] == 5) {
          wx.showModal({
            title: '',
            content: '很遗憾，计算机赢了',
            showCancel: false
          })
          over = true
          return
        }
      }
    }

  },

  // 画棋子
  drawPiece: function(){
    this.drawChess(false)
    
    for(var i = 0; i < 15; i++){
      for(var j = 0; j < 15; j++){
        if(chessBoards[i][j] == 1){
          console.log('白棋: i ' + i + ' j ' + j)
          context.beginPath()
          context.setFillStyle('#ffffff')
          context.moveTo(left + i * space + space * 0.3, 1 + j * space + top)
          context.arc(left + i * space, 1 + j * space + top, space * 0.3, 0, Math.PI * 2, false)
          context.fill()
        }else if(chessBoards[i][j] == 2){
          console.log('黑棋: i ' + i + ' j ' + j)
          context.beginPath()
          context.setFillStyle('#000000')
          context.moveTo(left + i * space + space * 0.3, 1 + j * space + top)
          context.arc(left + i * space, 1 + j * space + top, space * 0.3, 0, Math.PI * 2, false)
          context.fill()
        }
      }
    }
    
    context.draw()
  },

})