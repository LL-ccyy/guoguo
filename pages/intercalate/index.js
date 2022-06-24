const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  phoneNum:'',
   nickname:"浅兮",
   detail:"女",
   avtualImg:'',
   show: false,
   showon:false,
   actions: [
    {
      name: '女',
    },
    {
      name: '男',
    }
  ],
    actionson:[
      {
        name: '拍摄',
      },
      {
        name: '从照片中选择',
      }
    ],
  },

  showImg(){
    this.setData({
      showon:true
     });
  },
  // 性别展开
  showPopup(){
    this.setData({
      show: true
     });
  },
  onClose() {
    this.setData({ show: false });
  },
  // 选择性别
  onSelect(event) {
    console.log(event.detail)
    let detail=event.detail.name
    this.setData({
      detail:detail
    })
  },
  // 选择图片
  browse:function(){
    let that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#00ff20",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album');
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera');
          }
        }
      }
    })
  },
 
 /*打开相册、相机 */
   chooseWxImage: function(type) {
    let that = this;
    wx.chooseImage({
      count: that.data.countIndex,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function(res) {
        // 选择图片后的完成确认操作
        console.log(that.data.aimgurl);
        that.setData({
          aimgurl: res.tempFilePaths
        });
      }
    })
  },


// 获取手机号
onGetPhoneNumber(e) {
  console.log(e.detail.code)
},
// 用户切换
  change(e){

  },
  // 用户注销
  loginout(){
    console.log("logout");
    var user = app.userInfo;
    app.userInfo = null;
    hasUserInfo:false;
    wx.switchTab({
      url: '/pages/user/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
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
    
  }
})