// index.js

// import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const userInfo = wx.cloud.database().collection("users-data-basic")
Page({
  data:{
    userInfo:'',
    hasUserInfo:false,
    show:false,
    showAboutUs:false,
    oldName:undefined,
    showDelAccount:false
  },
  // 按钮点击事件
  getUI(e){
    const db = wx.cloud.database();
    const userOpenid=wx.getStorageSync('userOpenid');
    console.log("opid:",userOpenid)
    console.log('获取头像昵称',e)
    wx.getUserProfile({
      desc: '必须授权才能使用',
      // 接口调用成功
      success:res=>{
        // 将数据进行本地缓存 
        let userInfo=res.userInfo;
        wx.setStorageSync('userInfo', res.userInfo);
        db.collection('users-data-basic').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            _id: userOpenid, 
            userInfo: userInfo
          },
          success: function(res) {
            // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
            console.log(res)
          }
        })

        this.setData({
          userInfo:userInfo,
          hasUserInfo:true
        })
      },
      // 接口调用失败
      fail:err=>{
        console.log('登录失败',err)
      }
    })
  },

  showEnditBox() {
    this.setData({
      addOrEditStoreShow: true
    })
  },

  onCloseAES() {
    this.setData({
      addOrEditStoreShow: false
    })
  },
  changeimg() {
    wx.chooseMedia({
      count: 1,
      mediaType: 'image',
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        this.setData({
          img: res.tempFiles[0].tempFilePath,
          ifchangeMedia:1
        })
      }
    })
  },

  inputname(e) {
    console.log(e.detail);
    this.setData({
      NickName: e.detail
    })
  },

  changeInfo(){
    if(this.data.ifchangeMedia){
      this.changeMedia()
    }
    else{
      this.changename()
    }
  },

  
  async changeMedia() {
    let that = this
    var extension = null
    var media = this.data.media
    extension = this.data.img.split('.').pop();
    await new Promise((resolve, reject) => {
      // this.uploadfile(extension, this.data.imgList[i])
      wx.cloud.uploadFile({
        cloudPath: 'userInfo/' + new Date().getTime() + '.' + extension,
        filePath: this.data.img, // 文件路径
        success: res => {
          media = res.fileID
          this.setData({
            media: media
          })
          resolve(res)
        },
        fail: err => {
          // handle error
          reject(err)
        }
      })
    }).then(res => {
      this.change_othcom()
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 800
      })
      setTimeout(() => {
        that.setData({
          addOrEditStoreShow: false
        })
        that.onLoad()
      }, 800);
    });

  },

  change_othcom() {
    var that=this
    let userInfoChanged={
      nickName: this.data.NickName,
      avatarUrl: this.data.media
    }
    userInfo.doc(this.data.openid).set({
      data: {
        userInfo:userInfoChanged
      },
      success(res) {
        console.log(res);
        console.log("修改成功");
        wx.setStorageSync('userInfo',userInfoChanged);
      },
      fail(res) {
        console.log(res);
        console.log("修改失败");
      }
    })
  },

  changename(){
    var that=this
    let userInfoChanged={
      nickName: this.data.NickName,
      avatarUrl: this.data.img
    }
    userInfo.doc(this.data.openid).set({
      data: {
        userInfo:userInfoChanged
      },
      success(res) {
        console.log(res);
        console.log("修改成功");
        wx.setStorageSync('userInfo',userInfoChanged);
      },
      fail(res) {
        console.log(res);
        console.log("修改失败");
      }
    })
    wx.showToast({
      title: '修改成功',
      icon: 'success',
      duration: 800
    })
    setTimeout(() => {
      that.setData({
        addOrEditStoreShow: false
      })
      that.onLoad()
    }, 800);
  },


  onLoad: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const hasUserInfo = wx.getStorageSync('haveUserInfo');
    const openid = wx.getStorageSync('userOpenid');
    this.setData({
      userInfo: userInfo,
      hasUserInfo: hasUserInfo,
      openid: openid,
      img:userInfo.avatarUrl,
      NickName:userInfo.nickName
    });
  },
  onShow:function(){
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  intercalate(even){
    wx.redirectTo({
      url: '../intercalate/index',
    })
  },
  navToCouponPage() {
    wx.navigateTo({
      url: '../coupon/coupon-list/index',
    })
  },
  
  jumpNav(e) {
    const statusId = e.currentTarget.dataset.tabvalue;
    wx.navigateTo({ url: `/pages/orders/index?statusId=${statusId}` });
  },

  // 地址管理页面跳转
  toAddressList() {
    wx.navigateTo({
      url: '../address/address_choose/index',
    })
  },
  toSetting(){
    wx.navigateTo({
      url: '../intercalate/index',
    })
  },

  toStoreSystem(){
    wx.navigateTo({
      url: '../store_system/index',
    })
  },  
  toHelp() {
    this.setData({
      show: true
    })
  },
  toFavor(){
    wx.navigateTo({
      url: '../favourite/favourite',
    })
  },
  toAbout(){
    this.setData({showAboutUs:true})
  },
  onCloseAboutUs(){
    this.setData({showAboutUs:false})
  },
  onClose(){
    this.setData({
      show:false
    })
  },
  signOut(){
    wx.redirectTo({
      url: '../start/start',
    })
  },

  toDelAccount(){
    this.setData({
      showDelAccount:true
    })
  },

  onCloseDelAccount(){
    this.setData({
      showDelAccount:false
    })
  },

  confermDelete(){
    this.setData({
      showDelAccount:false
    })
    Dialog.alert({
      title: '注销失败',
      message: '您的账号暂不满足以上要求，请您联系小程序客服为您操作',
    }).then(() => {
      // on close
      this.setData({
        showDelAccount:false
      })
    });
    // Toast.fail('您的账号暂不满足以上要求，请您联系小程序客服为您操作');
  }

})
  
