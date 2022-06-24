const commentslist = wx.cloud.database().collection("comments")
const user = wx.cloud.database().collection("users-data-basic")
// pages/comments/comments.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    i: "五",
    value: '2',
    goodsid: '',
    users:[],
    commentsTemp:[]
  },
  // 根据goodid搜索对应评论
  searchgoodsid() {
    var that = this; //这句不能少，在查询时
    var goodsid = this.data.goodsid;
    wx.showLoading({
      title: '加载中',
    })
    return new Promise((resolve, reject) => {
      let len=that.data.commentsTemp.length
      commentslist.where({
        goodsid: goodsid, //查询条件
      })
      .skip(len)
      .get({
        success: res => {
          console.log('查询成功', res.data);
          //将查询返回的结果赋值给本地变量
          that.setData({
            commentsTemp: that.data.commentsTemp.concat(res.data),
          })
          wx.hideLoading({
          })
          if(res.data==0){
            wx.showToast({
              title: '已经到底了',
            })
          }
          resolve(res)
        },
        fail: res => {
          console.log(res)
        }
      })
    })
  },

  previewImage(e){
    console.log(e.currentTarget.dataset.url)
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    }) 
  },
  searchuser() {
    var users=this.data.users
    var that =this
    this.searchgoodsid().then(res => {
      var commentsTemp=this.data.commentsTemp
      console.log(res);
      var count=0
      commentsTemp.forEach(item=>{
        user.where({
          _openid: item._openid,
        }).get({
          success: function (res) {
            count++;
            item.avatarUrl=res.data[0].userInfo.avatarUrl
            item.nickName=res.data[0].userInfo.nickName
            // users.push(res.data[0].userInfo)
            // that.setData({
            //   commentTemp:this.data.commentsTemp
            // })
            if(count===commentsTemp.length){
              that.setData({
                comments:commentsTemp
              })
            }
          },
          fail: function (res) {
            console.log(res)
          }
        })
      })
    }).catch(res => {
      console.log(res)
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id);
    this.setData({
      goodsid:options.id
    })
    this.searchuser()
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
    this.searchuser()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})