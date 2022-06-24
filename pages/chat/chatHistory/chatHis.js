// pages/chat/chatHistory/chatHis.js

import NIM from "../../../vendors/NIM_Web_NIM_weixin_v7.7.0.js"
import {calcTimeHeader} from '../scripts/msgHandleFuntions'

const userData=wx.cloud.database().collection('users-data-basic')
const shopData=wx.cloud.database().collection('shops')

var nim ;
var toastRecord;
var data = {};
let app = getApp()

//消息函数
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
  // thisPage.scrollToBottom()
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

//会话函数
function onSessions(sessions) {
  console.log('收到会话列表', sessions);
  data.sessions = nim.mergeSessions(data.sessions, sessions);
  updateSessionsUI();
}
function onUpdateSession(session) {
  console.log('会话更新了', session);
  data.sessions = nim.mergeSessions(data.sessions, session);
  updateSessionsUI();
}
function updateSessionsUI() {
  // 刷新界面
  // console.log("now data is ",data)

  
  let pages = getCurrentPages();
  let thisPage = pages[pages.length - 1]
  if(thisPage.data.pageIs==='chatHis'){
    thisPage.convertRawSessionsListToRenderChatList(data.sessions)
  }
}



Page({
/**
   * 页面的初始数据
   */
  data: {
    pageIs:'chatHis',
    account: "123456",
    // iconNoMessage: '',
    loginUserAccount: '',
    translateX: 0,
    chatList: [], // [{account,nick,lastestMsg,type,timestamp,displayTime,message,unread,status}]
    chatAccount: {}, // {accountName: accountName} 备注:消息通知key为notification
    myAvatar : undefined,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    let myOpenid=wx.getStorageSync('userOpenid')
    shopData.where({
      _openid:myOpenid
    }).get({
      success:function(resShopInfo){
        console.log("my shopInfo is",resShopInfo.data[0])
        let thisShopInfo = resShopInfo.data[0]
        that.setData({
          myAvatar:resShopInfo.data[0].largePics
        })
        
        if(typeof(thisShopInfo.chatAccount) !== "undefined"&&thisShopInfo.chatAccount!==''){
          console.log("has account",thisShopInfo.chatAccount)
          that.setData({
            // loginAccountLogo:thisUserData.userInfo.avatarUrl,
            account:thisShopInfo.chatAccount
          })
          that.nimInit()
        }
        else{
          console.log("not have account")
          wx.cloud.callFunction({
            name: 'creatIMAccount',
            data: {
              // accountID : "123456"
              accountID:thisShopInfo._id,
              method:"creat"
            },
            success: function(resCreatAccount) {
              console.log("sucess",resCreatAccount.result.res111) 
              let creatResult=resCreatAccount.result.res111
              // console.log("sucess code",creatResult.code)
              if(creatResult.code===414){
                console.log("already register")
                shopData.doc(thisShopInfo._id).update({
                  data:{
                    chatAccount:thisShopInfo._id.toLowerCase(),
                  },
                  success:function(resUpdateDb){
                    console.log('update sucess',resUpdateDb)
                    that.setData({
                      account:thisShopInfo._id.toLowerCase()
                    })
                    that.nimInit()
                  }
                })
              }
              else if(creatResult.code===200){
                console.log("creat sucess")
                shopData.doc(thisShopInfo._id).update({
                  data:{
                    chatAccount:creatResult.info.accid
                  },
                  success:function(resUpdateDb){
                    console.log('update sucess',resUpdateDb)
                    that.setData({
                      // loginAccountLogo:thisUserData.userInfo.avatarUrl,
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
      }
    })
    // this.nimInit()
  },
  /**
   * 阻止事件冒泡空函数
   */
  stopEventPropagation() {
  },
  /**
   * 显示时排序
   */
  onShow() {
    // this.sortChatList()
    // nim.disconnect()
    // this.setData({
    //   chatList:[]
    // })
    // nim.connect()
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 0
    })
  }
  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {

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
    nim.disconnect()
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
      onmsg: onMsg,
      onsessions: onSessions,
      onupdatesession: onUpdateSession
    });

    // this.scrollToBottom()
  },


  /**
   * 排序chatlist
   */
  sortChatList() {
    if (this.data.chatList.length !== 0) {
      let chatList = [...this.data.chatList]
      chatList.sort((a, b) => {
        return parseInt(b.timestamp) - parseInt(a.timestamp)
      })
      this.setData({
        chatList
      })
    }
  },
  // /**
  //  * 传递消息进来，添加至最近会话列表
  //  * 必须字段 {type, time, from,to}
  //  */
  // addNotificationToChatList(msg) {
  //   let desc = ''
  //   let self = this
  //   switch (msg.type) {
  //     case 'addFriend': {
  //       desc = `添加好友-${msg.from}`
  //       break
  //     }
  //     case 'deleteFriend': {
  //       desc = `删除好友-${msg.from}`
  //       break
  //     }
  //     case 'deleteMsg':
  //       desc = `${msg.from}撤回了一条消息`
  //       break
  //     case 'custom':
  //       let data = JSON.parse(msg.content)
  //       let seen = []
  //       let str = data['content'] || JSON.stringify(data, function (key, val) {
  //         if (typeof val == "object") {
  //           if (seen.indexOf(val) >= 0)
  //             return
  //           seen.push(val)
  //         }
  //         return val
  //       }) // 可能没有content属性
  //       desc = `自定义系统通知-${str}`
  //       break
  //     default:
  //       desc = msg.type
  //       break
  //   }
  //   if (!self.data.chatAccount['notification']) { // 没有系统通知
  //     self.setData({
  //       chatList: [{
  //         account: '消息通知',
  //         timestamp: msg.time,
  //         displayTime: msg.time ? calcTimeHeader(msg.time) : '',
  //         lastestMsg: desc,
  //       }, ...self.data.chatList],
  //       chatAccount: Object.assign({}, self.data.chatAccount, { notification: 'notification' })
  //     })
  //   } else {
  //     let temp = [...self.data.chatList]
  //     temp.map((message, index) => {
  //       if (message.account === '消息通知') {
  //         temp[index].lastestMsg = desc
  //         temp[index].timestamp = msg.time
  //         temp[index].displayTime = msg.time ? calcTimeHeader(msg.time) : ''
  //         return
  //       }
  //     })
  //     temp.sort((a, b) => {
  //       return a.timestamp < b.timestamp
  //     })
  //     self.setData({
  //       chatList: temp
  //     })
  //   }
  // },
  /**
   * 捕获从滑动删除传递来的事件
   */
  catchDeleteTap(e) {
    console.log(e)
    if(e.detail==='right'){
      let that=this
      let session = e.currentTarget.dataset.session
      console.log("delete session",session)
      let scene=session.substr(0,session.indexOf('-'))
      let account = session.substr(session.indexOf('-')+1,session.length-1)
      let chatList = [...this.data.chatList]
      let deleteIndex = 0
      chatList.map((item, index) => {
        if (item.session === session) {
          deleteIndex = index
          return
        }
      })
      chatList.splice(deleteIndex, 1)
      this.setData({
        chatList,
      })
      // console.log(scene,to)

      nim.deleteSession({
        scene: scene,
        to: account,
        done: that.deleteSessionDone
      });
    }
    

  },

   deleteSessionDone:function(error, obj) {
    // console.log(error);
    // console.log(obj);
    console.log('删除服务器上的会话' + (!error?'成功':'失败'));
    wx.showToast({ // 显示Toast
      title: (!error?'删除成功':'删除失败'),
      icon: (!error?'success':'fail'),
      duration: 1500

    })
    // this.onShow()
  },

  /**
   * 单击进入聊天页面
   */
  switchToChating(e) {
    console.log(e)
    let account = e.currentTarget.dataset.account
    let session = e.currentTarget.dataset.session
    let avatar = e.currentTarget.dataset.avatar
    let nick = e.currentTarget.dataset.nick
    let myAccount = this.data.account
    let myAvatar = this.data.myAvatar?this.data.myAvatar:'/images/custorm.png'
    


    // let typeAndAccount = session.split('-')
    // 告知服务器，标记会话已读
    nim.resetSessionUnread(session)
    // 跳转
    wx.navigateTo({
      url: `../chat?chatTo=${account}&chatToAccountLogo=${avatar}&comesFromStoreSys=true&chatToAccountNick=${nick}&myChatAccount=${myAccount}&myChatAvator=${myAvatar}`,
    })
  },
  /**
   * 单击进入个人区域
   */
  switchToPersonCard(e) {
    let account = e.currentTarget.dataset.account
    if (account === 'ai-assistant') {
      return
    }
    // 重置该人的未读数
    // 重置某个会话的未读数,如果是已经存在的会话记录, 会将此会话未读数置为 0, 并会收到onupdatesession回调,而且此会话在收到消息之后依然会更新未读数
    app.globalData.nim.resetSessionUnread(`p2p-${account}`)
    // 压栈进入account介绍页
    clickLogoJumpToCard(this.data.friendCard, account, true)
  },
  /**
   * 判断消息类型，返回提示
   */
  judgeMessageType(rawMsg) {
    rawMsg = rawMsg || {}
    let msgType = ''
    if (rawMsg.type === 'image') {
      msgType = '[图片]'
    } else if (rawMsg.type === 'geo') {
      msgType = '[位置]'
    } else if (rawMsg.type === 'audio') {
      msgType = '[语音]'
    } else if (rawMsg.type === 'video') {
      msgType = '[视频]'
    } else if (rawMsg.type === 'custom') {
      msgType = rawMsg.pushContent || '[自定义消息]'
    } else if (rawMsg.type === 'tip') {
      msgType = '[提醒消息]'
    } else if (rawMsg.type === 'deleteMsg') {//可能是他人撤回消息
      msgType = '[提醒消息]'
    } else if (rawMsg.type === 'file') {
      msgType = '[文件消息]'
    } else if (rawMsg.type === '白板消息') {
      msgType = '[白板消息]'
    } else if (rawMsg.type === '阅后即焚') {
      msgType = '[阅后即焚]'
    } else if (rawMsg.type === 'robot') {
      msgType = '[机器人消息]'
    } else if (rawMsg.type === 'notification') {
      msgType = '[通知消息]'
    }
    return msgType
  },

  /**
   * 将原生列表转化为最近会话列表渲染数据
   */
  convertRawSessionsListToRenderChatList(rawSessionsList){
    let that = this

    let chatList = []
    let forCount=rawSessionsList.length
    let nowCount=0
    for(var index1=0;index1<rawSessionsList.length;index1++){
      let thisSession=rawSessionsList[index1]
      console.log('session item is',thisSession)
      let chatType = thisSession.scene
      let session = thisSession.id
      let account = thisSession.to
      let status = ''      
      let msg = thisSession.lastMsg
      let msgType = this.judgeMessageType(msg)
      // console.log('msgType',msgType)
      let lastestMsg = msgType
      let unread = thisSession.unread

      let nick=''
      let avatar=''

      userData.where({
        chatAccount:account
      }).get({
        success:function(resUserData){
          nowCount++
          // console.log("now count is ",nowCount)
          // console.log("for count is ",forCount)
          // console.log("get user data sucess",resUserData)
          let chatToUserData = resUserData.data[0]
          // console.log(typeof(chatToUserData))
          if(typeof(chatToUserData)!=='undefined'){
            nick=chatToUserData.userInfo.nickName
            avatar=chatToUserData.userInfo.avatarUrl
          }
          else{
            nick="测试账号:"+account
            avatar='/images/mine.jpg'
          }
          // console.log("nick",nick,"avatar",avatar,"lastestMsg",lastestMsg|| msg.text)
          // console.log('type',msgType || msg.type,"unread",unread,"displayTime",msg.time ? calcTimeHeader(msg.time) : '')
          chatList.push({
            chatType,
            session,
            account,
            status,
            nick,
            avatar,
            lastestMsg: lastestMsg || msg.text,
            type: msgType || msg.type,
            timestamp: msg.time,
            unread,
            displayTime: msg.time ? calcTimeHeader(msg.time) : ''
          })
          // console.log("now chatList is",chatList)
          if(nowCount>=forCount){
            // console.log("now chatList is",chatList)
            // 排序
            chatList.sort((a, b) => {
              return b.timestamp - a.timestamp
            })
            that.setData({
              chatList
            })

          }
        },
        fail:function(err){
          console.log("get user data fail",err)
        }
      })

    }

    
    

  },

  /**
   * 将原生消息转化为最近会话列表渲染数据
   */
  convertRawMessageListToRenderChatList(rawMessageList, friendCard, groupList, unreadInfo) {
    let chatList = []
    let sessions = Object.keys(rawMessageList)
    let index = 0
    sessions.map(session => {
      let account = session.indexOf('team-') === 0 ? session.slice(5, session.length) : session.slice(4, session.length)
      let isP2p = session.indexOf('p2p-') === 0
      let chatType = isP2p ? 'p2p' : (groupList[account] && groupList[account].type)
      let sessionCard = (isP2p ? friendCard[account] : groupList[account]) || {}
      let unixtimeList = Object.keys(rawMessageList[session])
      if (!unixtimeList) {
        return
      }
      let maxTime = Math.max(...unixtimeList)
      if (maxTime) {
        let msg = rawMessageList[session][maxTime + ''] || {}
        let msgType = this.judgeMessageType(msg)
        let lastestMsg = msgType
        let status =  isP2p ?  (sessionCard.status || '离线') : ''
        let nick = isP2p ? (sessionCard.nick || '非好友') : sessionCard.name
        let avatar =  isP2p ? (sessionCard.avatar || app.globalData.PAGE_CONFIG.defaultUserLogo) : (sessionCard.avatar || app.globalData.PAGE_CONFIG.defaultUserLogo)
        chatList.push({
          chatType,
          session,
          account,
          status,
          nick,
          avatar,
          lastestMsg: lastestMsg || msg.text,
          type: msgType || msg.type,
          timestamp: msg.time,
          unread: unreadInfo[session] || 0,
          displayTime: msg.time ? calcTimeHeader(msg.time) : ''
        })
      }
    })
    // 排序
    chatList.sort((a, b) => {
      return b.timestamp - a.timestamp
    })
    return chatList
  },
  /**
   * 计算最近一条发送的通知消息列表
   */
  caculateLastestNotification(notificationList) {
    let temp = Object.assign({}, notificationList)
    let lastestDesc = ''
    let systemMaxIndex = null
    let customMaxIndex = null
    // 从大到小
    let system = notificationList.system.sort((a, b) => {
      return b.msg.time - a.msg.time
    })
    let custom = notificationList.custom.sort((a, b) => {
      return b.msg.time - a.msg.time
    })
    if (system[0]) {
      if (custom[0]) {
        lastestDesc = system[0].msg.time - custom[0].msg.time ? system[0].desc : custom[0].desc
      } else {
        lastestDesc = system[0].desc
      }
    } else {
      if (custom[0]) {
        lastestDesc = custom[0].desc
      }
    }
    return lastestDesc
  },

  storeRawData(){
    console.log("store")
    this.setData({
      rawData:data
    })
  },

  nimDisconnect(){
    nim.disconnect()
  }
})