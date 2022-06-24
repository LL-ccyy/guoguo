// pages/chat/chat.js

import NIM from "../../vendors/NIM_Web_NIM_weixin_v7.7.0.js"
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import {calcTimeHeader,generateImageNode} from './scripts/msgHandleFuntions'
// import { database } from "wx-server-sdk";

let app = getApp()
// let store = app.store

const userData=wx.cloud.database().collection('users-data-basic')

var nim ;
var toastRecord;
var data = {};
// var nim = NIM.getInstance({debug: true,   // 是否开启日志，将其打印到console。集成开发阶段建议打开。
//   appKey: app.globalData.IMAppKey,
//   account: "developerTest1",
//   token: "000000",
//   db:true, //若不要开启数据库请设置false。SDK默认为true。
//   // privateConf: {}, // 私有化部署方案所需的配置
//   onconnect: onConnect,
//   onwillreconnect: onWillReconnect,
//   ondisconnect: onDisconnect,
//   onerror: onError,
//   onroamingmsgs: onRoamingMsgs,
//   onofflinemsgs: onOfflineMsgs,
//   onmsg: onMsg
// });
function onConnect() {
  console.log('连接成功');
}
function onWillReconnect(obj) {
  // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
  console.log('即将重连');
  console.log(obj.retryCount);
  console.log(obj.duration);
}
function onDisconnect(error) {
  // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
  console.log('丢失连接');
  console.log(error);
  if (error) {
    switch (error.code) {
      // 账号或者密码错误, 请跳转到登录页面并提示错误
      case 302:
        break;
      // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
      case 417:
        break;
      // 被踢, 请提示错误后跳转到登录页面
      case 'kicked':
        break;
      default:
        break;
    }
  }
}
function onError(error) {
  console.log(error);
}
function onRoamingMsgs(obj) {
  console.log('收到漫游消息', obj);
  // console.log("now Data is ",obj.msgs)
  pushMsg(obj.msgs);
  let pages = getCurrentPages();
  let thisPage = pages[pages.length - 1]
  thisPage.scrollToBottom()
}
function onOfflineMsgs(obj) {
  console.log('收到离线消息', obj);
  pushMsg(obj.msgs);
}
function onMsg(msg) {
  console.log('收到消息', msg.scene, msg.type, msg);
  pushMsg(msg);
  switch (msg.type) {
  case 'custom':
      onCustomMsg(msg);
      break;
  case 'notification':
      // 处理群通知消息
      onTeamNotificationMsg(msg);
      break;
  // 其它case
  default:
      break;
  }
}
function pushMsg(msgs) {
  if (!Array.isArray(msgs)) { msgs = [msgs]; }
  var sessionId = msgs[0].sessionId;
  // console.log("full data is ",msgs)
  // console.log('sessionIdis',sessionId)
  data.msgs = data.msgs || {};
  data.msgs[sessionId] = nim.mergeMsgs(data.msgs[sessionId], msgs);

  let pages = getCurrentPages();
  let thisPage = pages[pages.length - 1]
  if(thisPage.data.pageIs==='chat'){
    thisPage.transferMsgData(data)
  }
  else{
    thisPage.storeRawData()
  }
}
function onCustomMsg(msg) {
  // 处理自定义消息
}

// nim.previewFile({
//   type: 'image',
//   filePath: options.filePath,
//   maxSize: maxSize,
//   commonUpload: true,
//   uploadprogress(obj) {
//     // ...
//   },
//   done: (error, file) => {
//     // 通过其他API接口获取到长、宽、大小等图片属性
//     file.w = options.width;
//     file.h = options.height;
//     file.md5 = options.md5;
//     file.size = options.size;
//     const { scene, to } = options;
//     if (!error) {
//       constObj.nim.sendFile({
//         type: 'image',
//         scene,
//         to,
//         file,
//         done: (err, msg) => {
//           if (err) {
//             return;
//           }
//           this.appendMsg(msg);
//         },
//       });
//     }
//   },
// });



Page({

  /**
   * 页面的初始数据
   */
  data: {
    // defaultUserLogo: app.globalData.PAGE_CONFIG.defaultUserLogo,
    comesFromStoreSys:false,
    pageIs:'chat',
    msgRawData:null,
    videoContext: null, // 视频操纵对象
    isVideoFullScreen: false, // 视频全屏控制标准
    videoSrc: '', // 视频源
    recorderManager: null, // 微信录音管理对象
    recordClicked: false, // 判断手指是否触摸录音按钮
    iconBase64Map: {}, //发送栏base64图标集合
    isLongPress: false, // 录音按钮是否正在长按
    chatWrapperMaxHeight: 0,// 聊天界面最大高度
    account: "developertest1",
    chatTo: '123456', //聊天对象account
    chatType: 'p2p', //聊天类型 advanced 高级群聊 normal 讨论组群聊 p2p 点对点聊天
    loginAccountLogo: '',  // 登录账户对象头像
    chatToAccountLogo:'',   //聊天对象头像
    focusFlag: false,//控制输入框失去焦点与否
    emojiFlag: false,//emoji键盘标志位
    moreFlag: false, // 更多功能标志
    tipFlag: false, // tip消息标志
    tipInputValue: '', // tip消息文本框内容
    sendType: 0, //发送消息类型，0 文本 1 语音
    messageArr: [], //[{text, time, sendOrReceive: 'send', displayTimeHeader, nodes: []},{type: 'geo',geo: {lat,lng,title}}]
    inputValue: '',//文本框输入内容
    from: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
    console.log(options)
    if(typeof(options.chatTo)==='undefined'||typeof(options.chatToAccountLogo)==='undefined'){
      console.error("should povide chatTo and chatToAccountLogo")
    }
    else{
      this.setData({
        chatTo:options.chatTo,
        chatToAccountLogo:options.chatToAccountLogo
      })
    }
    if(options.comesFromStoreSys!=='undefined'&&options.comesFromStoreSys==='true'){
      // console.log("enter yes")
      wx.setNavigationBarTitle({
        title: options.chatToAccountNick,
      })
      that.setData({
        loginAccountLogo:options.myChatAvator,
        account:options.myChatAccount,
        comesFromStoreSys:true
      })
      that.nimInit()
    }
    else{
      // console.log("enter else")
      this.setData({comesFromStoreSys:false})
      let myOpenid=wx.getStorageSync('userOpenid')
      // console.log("myOpenid",myOpenid)
      userData.where({
        _openid:myOpenid
      }).get({
        success: function(resUserData) {
          let thisUserData=resUserData.data[0]
          // console.log("thisUserData",thisUserData)
          console.log(thisUserData.chatAccount)
          if(typeof(thisUserData.chatAccount) !== "undefined"&&thisUserData.chatAccount!==''){
            console.log("has account",thisUserData.chatAccount)
            that.setData({
              loginAccountLogo:thisUserData.userInfo.avatarUrl,
              account:thisUserData.chatAccount
            })
            that.nimInit()
          }
          else{
            console.log("not have account")
            wx.cloud.callFunction({
              // 云函数名称
              name: 'creatIMAccount',
              // 传给云函数的参数
              data: {
                // accountID:"123458"
                accountID:myOpenid,
                method:"creat"
              },
              success: function(resCreatAccount) {
                console.log("sucess",resCreatAccount.result.res111) 
                let creatResult=resCreatAccount.result.res111
                // console.log("sucess code",creatResult.code)
                if(creatResult.code===414){
                  console.log("already register")
                  userData.doc(thisUserData._id).update({
                    data:{
                      chatAccount:myOpenid.toLowerCase(),
                    },
                    success:function(resUpdateDb){
                      console.log('update sucess',resUpdateDb)
                      that.setData({
                        loginAccountLogo:thisUserData.userInfo.avatarUrl,
                        account:myOpenid.toLowerCase()
                      })
                      that.nimInit()
                    }
                  })
                }
                else if(creatResult.code===200){
                  console.log("creat sucess")
                  userData.doc(thisUserData._id).update({
                    data:{
                      chatAccount:creatResult.info.accid
                    },
                    success:function(resUpdateDb){
                      console.log('update sucess',resUpdateDb)
                      that.setData({
                        loginAccountLogo:thisUserData.userInfo.avatarUrl,
                        account:creatResult.info.accid
                      })
                      that.nimInit()
                    }
                  })
                }
              },
              fail: console.error
            })
          }
        },
        fail:function(err){
          console.log(err)
        }
      })
      // let myAvatarUrl=wx.getStorageSync('userInfo').avatarUrl;
      // this.setData({
      //   loginAccountLogo: myAvatarUrl
      // })
      // this.nimInit()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.comesFromStoreSys){
      let pages = getCurrentPages();
      let lastPage = pages[pages.length - 2]
      console.log("last page data is",lastPage.data.rawData)
      data= lastPage.data.rawData
      this.setData({
        lastPageRawData:lastPage.data.rawData
      })
      this.transferMsgData(lastPage.data.rawData)
    }
    
    // nim.connect()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // nim.disconnect()

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(!this.data.comesFromStoreSys){
      nim.disconnect()
    }
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  nimInit:function(){
      nim = NIM.getInstance({
        debug: true,   // 是否开启日志，将其打印到console。集成开发阶段建议打开。
        appKey: app.globalData.IMAppKey,
        account: this.data.account,
        token: "000000",
        db:false, //若不要开启数据库请设置false。SDK默认为true。
        syncSessionUnread:true,
        // autoMarkRead:false,     //不自动标记
        // privateConf: {}, // 私有化部署方案所需的配置
        onconnect: onConnect,
        onwillreconnect: onWillReconnect,
        ondisconnect: onDisconnect,
        onerror: onError,
        onroamingmsgs: onRoamingMsgs,
        onofflinemsgs: onOfflineMsgs,
        onmsg: onMsg
      });
  
      this.scrollToBottom()
  },

  /**
   * 切换发送文本类型
   */
  switchSendType() {
    this.setData({
      sendType: this.data.sendType == 0 ? 1 : 0,
      focusFlag: false,
      emojiFlag: false
    })
  },
  /**
   * 获取焦点
   */
  inputFocus(e) {
    this.setData({
      emojiFlag: false,
      focusFlag: true
    })
  },
  /**
   * 失去焦点
   */
  inputBlur() {
    this.setData({
      focusFlag: false
    })
  },
  /**
   * 文本框输入事件
   */
  inputChange(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  /**
   * 键盘单击发送，发送文本
   */
  inputSend(e) {
    this.sendRequest(e.detail.value)
  },

   /**
   * 手动模拟按钮长按，
   */
  longPressStart() {
    let self = this
    self.setData({
      recordClicked: true
    })
    setTimeout(() => {
      if (self.data.recordClicked == true) {
        self.executeRecord()
      }
    }, 350)
  },
  /**
  * 语音按钮长按结束
  */
 longPressEnd() {
   this.setData({
     recordClicked: false
   })
   // 第一次授权，
   if (!this.data.recorderManager) {
     this.setData({
       isLongPress: false
     })
     return
   }
   if (this.data.isLongPress === true) {
     this.setData({
       isLongPress: false
     })
     toastRecord.clear()
     this.data.recorderManager.stop()
   }
 },
 /**
  * 执行录音逻辑
  */
 executeRecord() {
   let self = this
   self.setData({
     isLongPress: true
   })
   wx.getSetting({
     success: (res) => {
       let recordAuth = res.authSetting['scope.record']
       if (recordAuth == false) { //已申请过授权，但是用户拒绝
         wx.openSetting({
           success: function (res) {
             let recordAuth = res.authSetting['scope.record']
             if (recordAuth == true) {
               Toast.success('授权成功')
             } else {
               Toast( '请授权录音')
             }
             self.setData({
               isLongPress: false
             })
           }
         })
       } else if (recordAuth == true) { // 用户已经同意授权
         self.startRecord()
       } else { // 第一次进来，未发起授权
         wx.authorize({
           scope: 'scope.record',
           success: () => {//授权成功
            Toast.success('授权成功')
           }
         })
       }
     },
     fail: function () {
       Toast.fail('鉴权失败，请重试')
     }
   })
 },
 /**
  * 开始录音
  */
 startRecord() {
   let self = this
   toastRecord = Toast({message:'开始录音', duration: 120000 })
   const recorderManager = self.data.recorderManager || wx.getRecorderManager()
   const options = {
     duration: 120 * 1000,
     format: 'mp3'
   }
   recorderManager.start(options)
   self.setData({
     recorderManager
   })
   recorderManager.onStop((res) => {
     if (res.duration < 2000) {
       Toast('录音时间太短')
     } else {
       self.sendAudioMsg(res)
     }
   })
 },

  /**
   * 选择相册图片
   */
  chooseImageToSend(e) {
    let type = e.currentTarget.dataset.type
    let self = this
    self.setData({
      moreFlag: false
    })
    wx.chooseImage({
      sourceType: ['album'],
      success: function (res) {
        self.sendImageToNOS(res)
      },
    })
  },
  /**
   * 选择拍摄视频或者照片
   */
  chooseImageOrVideo() {
    let self = this
    self.setData({
      moreFlag: false
    })
    wx.showActionSheet({
      itemList: ['照相', '视频'],
      success: function (res) {
        if (res.tapIndex === 0) { // 相片
          wx.chooseImage({
            sourceType: ['camera'],
            success: function (res) {
              self.sendImageToNOS(res)
            },
          })
        } else if (res.tapIndex === 1) { // 视频
          wx.chooseVideo({
            sourceType: ['camera', 'album'],
            success: function (res) {
              if (res.duration > 60) {
                showToast('text', '视频时长超过60s，请重新选择')
                return
              }
              console.log(res);
              // {duration,errMsg,height,size,tempFilePath,width}
              self.sendVideoToNos(res)
            }
          })
        }
      }
    })
  },
  /**
   * 发送网络请求：发送文本消息(包括emoji)
   */
  sendRequest(text) {
    let self = this
    nim.sendText({
      scene: 'p2p' ,
      to: this.data.chatTo,
      text,
      done: (err, msg) => {
        // 判断错误类型，并做相应处理
        if (self.handleErrorAfterSend(err)) {
          return
        }
        // 存储数据到store
        console.log("success and msg is",msg)
        self.saveChatMessageListToStore(msg)

        self.setData({
          inputValue: '',
          focusFlag: false
        })
        // 滚动到底部
        self.scrollToBottom()
      }
    })
  },
  
  /**
   * 发送语音消息
   */
  sendAudioMsg(res) {
    wx.showLoading({
      title: '发送中...',
    })
    let tempFilePath = res.tempFilePath
    let self = this
    // console.log(tempFilePath)
    nim.sendFile({
      scene: self.data.chatType === 'p2p' ? 'p2p' : 'team',
      to: self.data.chatTo,
      type: 'audio',
      wxFilePath: tempFilePath,
      done: function (err, msg) {
        wx.hideLoading()
        // 判断错误类型，并做相应处理
        if (self.handleErrorAfterSend(err)) {
          return
        }
        // 存储数据到store
        self.saveChatMessageListToStore(msg)

        // 滚动到底部
        self.scrollToBottom()
      }
    })
  },
  /**
   * 发送视频文件到nos
   */
  sendVideoToNos(res) {
    wx.showLoading({
      title: '发送中...',
    })
    // {duration,errMsg,height,size,tempFilePath,width}
    let self = this
    let tempFilePath = res.tempFilePath
    // 上传文件到nos
    nim.sendFile({
      type: 'video',
      scene: self.data.chatType === 'p2p' ? 'p2p' : 'team',
      to: self.data.chatTo,
      wxFilePath: tempFilePath,
      done: function (err, msg) {
        wx.hideLoading()
        // file: {dur, ext,h,md5,name,size,url,w}
        // 判断错误类型，并做相应处理
        if (self.handleErrorAfterSend(err)) {
          return
        }
        // 存储数据到store
        self.saveChatMessageListToStore(msg)

        // 滚动到底部
        self.scrollToBottom()
      }
    })
  },
  /**
   * 发送图片到nos
   */
  sendImageToNOS(res) {
    wx.showLoading({
      title: '发送中...',
    })
    let self = this
    let tempFilePaths = res.tempFilePaths
    for (let i = 0; i < tempFilePaths.length; i++) {
      // 上传文件到nos
      nim.sendFile({
        // app.globalData.nim.previewFile({
        type: 'image',
        scene: self.data.chatType === 'p2p' ? 'p2p' : 'team',
        to: self.data.chatTo,
        wxFilePath: tempFilePaths[i],
        done: function (err, msg) {
          wx.hideLoading()
          // 判断错误类型，并做相应处理
          if (self.handleErrorAfterSend(err)) {
            return
          }
          // 存储数据到store
          self.saveChatMessageListToStore(msg)

          // 滚动到底部
          self.scrollToBottom()
        }
      })
    }

  },
  /**
   * 统一发送消息后打回的错误信息
   * 返回true表示有错误，false表示没错误
   */
  handleErrorAfterSend(err) {
    if (err) {
      if (err.code == 7101) {
        Toast('你已被对方拉黑')
      }
      console.log(err)
      return true
    }
    return false
  },
  /**
   * 滚动页面到底部
   */
  scrollToBottom() {
    wx.pageScrollTo({
      scrollTop: 999999,
      duration: 100
    })
  },
  /**
   * 保存数据到store
   */
  saveChatMessageListToStore(rawMsg, handledMsg) {
    pushMsg(rawMsg)
    // store.dispatch({
    //   type: 'RawMessageList_Add_Msg',
    //   payload: { msg: rawMsg }
    // })
  },
  /**
   * 收起所有输入框
   */
  chatingWrapperClick(e) {
    // console.log(e)
    this.foldInputArea()
  },
  /**
   * 收起键盘
   */
  foldInputArea() {
    this.setData({
      focusFlag: false,
      moreFlag: false
    })
  }, 
  /**
  * 阻止事件冒泡空函数
  */
 stopEventPropagation() {
 },
 /**
  * 全屏播放视频
  */
 requestFullScreenVideo(e) {
   let video = e.currentTarget.dataset.video
   console.log("call full video")
   let videoContext = wx.createVideoContext('videoEle')

   this.setData({
     isVideoFullScreen: true,
     videoSrc: video.url,
     videoContext
   })
   videoContext.requestFullScreen()
   videoContext.play()
 },
 /**
  * 视频播放结束钩子
  */
 videoEnded() {
   this.setData({
     isVideoFullScreen: false,
     videoSrc: ''
   })
 },
 /**
  * 播放音频
  */
 playAudio(e) {
     
   toastRecord = Toast({
       message:'播放中', 
       duration: 120 * 1000,
       mask: true
    })
   let audio = e.currentTarget.dataset.audio
   const audioContext = wx.createInnerAudioContext()
   if (audio.ext === 'mp3') { // 小程序发送的
     audioContext.src = audio.url
   } else {
     audioContext.src = audio.mp3Url
   }
   audioContext.play()
   audioContext.onPlay(() => {
   })
   audioContext.onEnded(() => {
    toastRecord.clear()
   })
   audioContext.onError((res) => {
     Toast(res.errCode)
   })
 },

  /**
   * 切出更多
   */
  toggleMore() {
    this.setData({
      moreFlag: !this.data.moreFlag,
      focusFlag: false
    })
  },
/**
   * 距离上一条消息是否超过两分钟
   */
  judgeOverTwoMinute(time, messageArr) {
    let displayTimeHeader = ''
    let lastMessage = messageArr[messageArr.length - 1]
    if (lastMessage) {//拥有上一条消息
      let delta = time - lastMessage.time
      // console.log("this time is",time,"last time is",lastMessage.time)
      // console.log("delta is ",delta)
      if (delta > 2 * 60 * 1000) {//两分钟以上
        displayTimeHeader = calcTimeHeader(time)
      }
      else{
        displayTimeHeader = ''
      }
    } else {//没有上一条消息
      displayTimeHeader = calcTimeHeader(time)
    }
    return displayTimeHeader
  },
  /**
   * 原始消息列表转化为适用于渲染的消息列表
   * {unixtime1: {flow,from,fromNick,idServer,scene,sessionId,text,target,to,time...}, unixtime2: {}}
   * =>
   * [{text, time, sendOrReceive: 'send', displayTimeHeader, nodes: []},{type: 'geo',geo: {lat,lng,title}}]
   */
  convertRawMessageListToRenderMessageArr(rawMsgList) {
    let messageArr = []
    for(let item in rawMsgList) {
      let rawMsg = rawMsgList[item]
      let msgType = ''
      msgType = rawMsg.type
      let displayTimeHeader = this.judgeOverTwoMinute(rawMsg.time, messageArr)
      let sendOrReceive = rawMsg.flow === 'in' ? 'receive' : 'send'
      if(rawMsg.flow==='in'){
        nim.markMsgRead(rawMsg)
      }
      // let sendOrReceive='send'
      // if(rawMsg.from===this.data.account&&rawMsg.to===this.data.chatTo){
      //   sendOrReceive='send'
      // }
      // else{
      //   sendOrReceive='receive'
      // }
      let specifiedObject = {}
      switch(msgType) {
        case 'text': {
          specifiedObject = {
            nodes: rawMsg.text
          }
          break
        }
        case 'image': {
          specifiedObject = {
            nodes: generateImageNode(rawMsg.file)
          }
          break
        }
        case 'audio': {
          specifiedObject = {
            audio: rawMsg.file
          }
          break
        }
        case 'video': {
            let vedioInfo=rawMsg.file
            let fullWidth=vedioInfo.w
            let fullHeight=vedioInfo.h
            let thumb={}
            if((fullHeight/fullWidth)>=(4/3)){
                thumb={
                    height:500,
                    width:500*fullWidth/fullHeight,
                }
            }
            else{
                thumb={
                    height:300,
                    width:300*fullWidth/fullHeight,
                }
            }
            vedioInfo.thumb=thumb
            specifiedObject = {
                video: vedioInfo
            }
          break
        }
        case 'file':
        case 'custom':
          specifiedObject = {
            nodes: [{
              type: 'text',
              text: '自定义消息'
            }]
          }
          break;
        default: {
          break
        }
      }
      messageArr.push(Object.assign({}, {
        from: rawMsg.from,
        type: msgType,
        text: rawMsg.text || '',
        time: rawMsg.time,
        sendOrReceive,
        displayTimeHeader
      }, specifiedObject))
    }
    return messageArr
  },

  transferMsgData:function(msgData){
    console.log("now data is ",data)
    var messageArr
    if(this.data.comesFromStoreSys){
      // let msgRawData=
      console.log('data transfered'.msgData)
      messageArr=this.convertRawMessageListToRenderMessageArr(msgData.msgs['p2p-'+this.data.chatTo])
    }
    else{
      messageArr=this.convertRawMessageListToRenderMessageArr(data.msgs['p2p-'+this.data.chatTo])
    }
    this.setData({
    //   msgRawData:msgData.msgs,
      messageArr:messageArr
    })
    this.scrollToBottom()
  }

})