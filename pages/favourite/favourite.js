// pages/favourite/favourite.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
// 获取应用实例
const favourite=wx.cloud.database().collection("favourite")
const goods_list=wx.cloud.database().collection("goods")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartGoods: [],
    cartTotal: {
        "goodsCount": 0,
        "goodsAmount": 0.00,
        "checkedGoodsCount": 0,
        "checkedGoodsAmount": 0.00,
        "userId_test": ''
    },
    submitBtnEnable : false,
    isEditCart: false,
    checkedAllStatus: true,
    editCartList: [],
    isTouchMove: false,
    startX: 0, //开始坐标
    startY: 0,
    hasCartGoods: 0,
    goodslist:[],
    list:[],
    tap:0,
    // 购物车点击数量
    tap_num:0,
    ind:[],
    choose_all:0,
    all_price:0,
    selectedgoodsList:[],     //生成订单前传入的已选择商品列表 元素包括商品id、商品size、商品数量
  },
  get_cart(){
    this.setData({
      list:[]
    })
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.list.length
    var that =this
    var goodslist=this.data.goodslist
      favourite
      .where({
        _openid : that.data._openid
      })
      .skip(len)
      .get({
          success(res){
        console.log(res);
        that.setData({
          list:that.data.list.concat(res.data),
        })
    //     res.data.forEach((item) => {
    //       that.tap_goods_num(item.goodsid)
    // });
    wx.hideLoading({
    })
    if(res.data==0){
      wx.showToast({
        title: '已经到底了',
      })
    }

    var count=0
    that.data.list.forEach(item=>{
      goods_list.doc(item.goodsid).get({
        success: function(res) {
          count++
          item.price=res.data.price
          item.thumbnail=res.data.thumbnail
          item.headline=res.data.headline
          that.setData({
              list:that.data.list
          })

          if(count==that.data.list.length){
            console.log("1121");
            console.log(that.data.list);
            that.setData({
              goodslist:that.data.list
            })
          }
          resolve(res)
        },
      })
    })
    // for(var i=0;i<res.data.length;i++){
    // // await  that.tap_goods_num(res.data[i].goodsid)
    //    that.searchgoodsid(res.data[i].goodsid)
    // }
      }
    })
  },

  searchgoodsid(goodsid){
    var that =this
    var goodslist=this.data.goodslist
    return new Promise((resolve, reject) => {
   console.log(goodsid);
   goods_list.doc(goodsid).get({
    success: function(res) {
      // res.data 包含该记录的数据
     console.log("111",res.data)
      goodslist.push(res.data)
      that.setData({
          goodslist:goodslist
      })
      console.log(goodslist);
      resolve(res)
    },
  })
})
},
onDelete : function(e){
  let goodsToDelect=this.data.list[e.currentTarget.id];
  let that = this
  Dialog.confirm({
    message: '确定删除此收藏吗？',
  }).then(() => {
    console.log("tapped yes,id is",goodsToDelect._id);
    favourite.doc(goodsToDelect._id).remove({
      success: function(res) {
        console.log(res);
        Toast.success('删除成功');
        that.onLoad();
      },
      fail:function(res){
        console.log("failed",res);
        Toast.fail('删除失败');
      }
    })
  });
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.get_cart()
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
    this.get_cart()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})