// pages/fruit_types/index.js
const db = wx.cloud.database(); //初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeKey: 0,
    fruitTypes: [
      "橘子","猕猴桃","西瓜","柠檬","苹果","梨","菠萝","香蕉","百香果","其他"
    ],
    goodsToShow:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    const num = options.typeid == 4 ? 0 : options.typeid;
    this.setData({
      activeKey: num
    });
    let that=this;
    let len=this.data.goodsToShow.length
    db.collection('goods').where({
      tag:that.data.fruitTypes[that.data.activeKey],
      goodsStatus:1
    })
    .skip(len)
    .get({
      success: function(res) {
        // res.data 是包含以上定义的两条记录的数组
        that.setData({
          goodsToShow:that.data.goodsToShow.concat(res.data)
        });
        console.log(res.data)
        wx.hideLoading({
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    wx.showLoading({
      title: '加载中',
    })
        let that=this;
        let len=this.data.goodsToShow.length
        db.collection('goods').where({
          tag:that.data.fruitTypes[that.data.activeKey],
          goodsStatus:1
        })
        .skip(len)
        .get({
          success: function(res) {
            // res.data 是包含以上定义的两条记录的数组
            that.setData({
              goodsToShow:that.data.goodsToShow.concat(res.data)
            });
            console.log(res.data)
            if(res.data.length==0){
              wx.hideLoading({
              })
              wx.showToast({
                title: '已经到底了',
              })
            }
          }
        })
      },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  navToDetailPage:function(e) {
    console.log(e);
    let goodID=e.currentTarget.id;
    wx.navigateTo({
      url: '../goods_detail/index?id='+goodID,
    })
  },

  /**
   * 切换侧边栏事件
   */
  onSideBarChange:function(e){
    const db = wx.cloud.database(); //初始化数据库
    console.log(e);

    let that=this;
    db.collection('goods').where({
      tag:that.data.fruitTypes[e.detail],
      goodsStatus:1
    })
    .get({
      success: function(res) {
        // res.data 是包含以上定义的两条记录的数组
        that.setData({
          activeKey:e.detail,
          goodsToShow:res.data
        });
        console.log(res.data)
      }
    })
  },



})