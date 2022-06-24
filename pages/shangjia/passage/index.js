// pages/passage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    time: '',
    content: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {title, time, url} = options;
    wx.request({
      url: `https://test-9gpxwplv4c617e36-1301517462.ap-guangzhou.app.tcloudbase.com?url=${url}`,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.setData({
          title: title,
          time: time,
          content: res.data
        });
      }
    })
  },
})