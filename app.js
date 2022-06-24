// app.js
App({
  
  globalData: {
    userInfo: null,
    haveUserInfo: false,
    userOpenid:null,
    IMAppKey:"270db835f0270a75bc4de5aa76f1c0dd",
    roleId:2,
    list:[]
  },
  switchTabWithRole:function(roleId){
    console.log(roleId);
    if(roleId == 1){
      this.globalData.list =[
        {
          pagePath: "/pages/index/index",
          text: "首页",
          selectedIconPath: "/images/homepage-alive.png",
          iconPath: "/images/homepage.png"
        },
        {
          pagePath: "/pages/cart/index",
          text: "购物车",
          selectedIconPath: "/images/shopping-alive.png",
          iconPath: "/images/shopping.png"
        },
        {
          pagePath: "/pages/user/index",
          text: "我的",
          selectedIconPath: "/images/mine-alive.png",
          iconPath: "/images/mine.png"
        }
      ]
      if (this.changeTabbarCallback) {
        this.changeTabbarCallback(this.globalData.list)
      }
      wx.switchTab({
       url: '/pages/index/index',
      })
    }

    if(roleId == 2){
      this.globalData.list =[
        {
          pagePath: "/pages/chat/chatHistory/chatHis",
          iconPath: "/images/chat.png",
          selectedIconPath: "/images/chat-alive.png",
          text: "消息"
        }, {
          pagePath: "/pages/store_system/index",
          iconPath: "/images/mine.png",
          selectedIconPath: "/images/mine-alive.png",
          text: "我的"
        }

      ]
      if (this.changeTabbarCallback) {
        console.log(this.globalData.list);
        this.changeTabbarCallback(this.globalData.list)
      }

        wx.switchTab({
          url: '/pages/store_system/index',
         })


    }
  },


  onLaunch() {
    // if (this.globalData.userInfo) {
    //   wx.switchTab({
    //     url: 'pages/hexiao/hexiao',
    //   })
    // } else {
    //     wx.reLaunch({
    //         url: 'pages/choose/choose'
    //     })
    // }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env:"cloud1-0gtwyi069b662d65"
      });
    }

    const db = wx.cloud.database()

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code){
          wx.cloud.callFunction({
            name: "getOpenid"
          }).then(res => {
            let openid = res.result.openid
            console.log("获取openid成功", openid)
            wx.setStorage({
              key:"userOpenid",
              data:openid
            })
            db.collection('users-data-basic').doc(openid).get({
              success: function(res) {// res.data 包含该记录的数据
                let userInfo=res.data.userInfo
                wx.setStorage({
                  key:"userInfo",
                  data:userInfo
                })
                wx.setStorage({
                  key:"haveUserInfo",
                  data:true
                })
                console.log(res.data)
              },
              fail(err){
                console.log('查询openid失败,请求用户登陆',res)
              }
            },
            )
          }).catch(res => {
            console.log("获取openid失败", res)
          })
        }else{
          console('登录失败！'+res.errMsg)
        }
      }
    })
  },

})
