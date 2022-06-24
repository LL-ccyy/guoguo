// pages/choose/choose.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseID:0
  },

  want2buy(){
    // app.globalData.roleId=1;
    app.switchTabWithRole(1);
    this.setData({
      chooseID:1
    })
  },

  want2sell(){
    // app.globalData.roleId=2;
    app.switchTabWithRole(2);
    this.setData({
      chooseID:1
    })
  },
  testLogin(){
    console.log(app.globalData.roleId);

    if(app.globalData.roleId==1){
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
    else if(app.globalData.roleId==2){
      wx.switchTab({
        url: '/pages/shangjia/index/index',
      })
    }
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
