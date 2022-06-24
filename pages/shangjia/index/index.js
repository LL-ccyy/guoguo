Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0
  },
  onChange(event) {
    wx.showToast({
      title: `切换到标签 ${event.detail.name}`,
      icon: 'none',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      active:option.index==='undefined'?'0':option.index,
    })
    let that=this
    wx.request({
      url: 'https://test-9gpxwplv4c617e36-1301517462.ap-guangzhou.app.tcloudbase.com/list',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        that.setData({
          active:option.index==='undefined'?0:option.index,
          list: res.data
        });
        wx.hideLoading();
        wx.showToast({
          title: '加载完成',
        })
      }
    })
  },
  getPage(e) {
    const {title, time, url} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../passage/index?title=${title}&url=${url}&time=${time}`,
    })
  },
  getVedio(e){
    console.log(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '/pages/video/video?index='+e.currentTarget.dataset.index,
    })
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
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 0
    })
  }
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