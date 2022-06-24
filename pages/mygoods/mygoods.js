// pages/mygoods/mygoods.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const goodsList=wx.cloud.database().collection("goods")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop_id:"",
    _openid:"",
    tabs: ["全部","在售中","待上架"],
    active: 0,            //tab当前活动
    goodslist: [],
    show: false,
    actions1: [
      {
        name: '修改',
      },
      {
        name: '下架',
      }
    ],
    actions2: [
      {
        name: '修改',
      },
      {
        name: '上架',
      }
    ],
    changing:''
  },

  onChange(event) {
    console.log(event.detail.index)
    this.setData({
      goodslist:[],
      goodsStatus:event.detail.index
    })
      this.getGoodsList(event.detail.index)
},

more(e){
  console.log(e.currentTarget.dataset.index);
  this.setData({
    changing:e.currentTarget.dataset.index,
    show:true
  })
},

takedown(){
  let that=this
  Dialog.confirm({
    title: '提示',
    message: '您确定要下架该商品吗',
  })
    .then(() => {
      goodsList.doc(that.data.goodslist[that.data.changing]._id).update({
        data:{
          goodsStatus:2,
        },
        success: function(res) {
          that.setData({
            goodslist:[]
          })
          Toast.success('下架成功');
          that.getGoodsList(that.data.goodsStatus)
        }
      })
    })
    .catch(() => {
      // on cancel
    });
},
takeup(){
  let that=this
  Dialog.confirm({
    title: '提示',
    message: '您确定要上架该商品吗',
  })
    .then(() => {
      goodsList.doc(that.data.goodslist[that.data.changing]._id).update({
        data:{
          goodsStatus:1,
        },
        success: function(res) {
          that.setData({
            goodslist:[]
          })
          Toast.success('上架成功');
          that.getGoodsList(that.data.goodsStatus)
        }
      })
    })
    .catch(() => {
      // on cancel
    });
},


change(){
  wx.navigateTo({
    url: '../store_system/good_set/index?goodsid='+this.data.goodslist[this.data.changing]._id+'&shop_id='+this.data.shop_id
  })
},

onClose() {
this.setData({
  show:false
})
},

onSelect(event) {
  console.log(event.detail.name);
  if(event.detail.name=='下架'){
    this.takedown()
  }
  if(event.detail.name=='上架'){
    this.takeup()
  }
  if(event.detail.name=='修改'){
    this.change()
  }
},

getGoodsList:function(goodsStatus){
  console.log("goodsStatus is ",goodsStatus)
  wx.showLoading({
    title: '加载中',
  })
  let len=this.data.goodslist.length
  const _ = wx.cloud.database().command
  console.log("shop_id:",this.data.shop_id)
  let that = this;
  if(goodsStatus==0){
    goodsList.where({
      shop_id : that.data.shop_id
    })
    .skip(len)
    .get({
      success: function(res) {
        // console.log("now is the whole database:",res.data)
        that.setData({
          goodslist:that.data.goodslist.concat(res.data)
        })
        wx.hideLoading({
        })
        if(res.data==0){
          wx.showToast({
            title: '已经到底了',
          })
        }
      }
    })
  }
  else{
    goodsList.where({
      goodsStatus : goodsStatus,
      shop_id : that.data.shop_id
    })
    .skip(len)
    .get({
      success: function(res) {
        console.log("now is ",res.data)
        that.setData({
          goodslist:that.data.goodslist.concat(res.data)
        })
        wx.hideLoading({
        })
        if(res.data==0){
          wx.showToast({
            title: '已经到底了',
          })
        }
      }
    })
  }
  
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _openid=wx.getStorageSync('userOpenid');
    let pages = getCurrentPages();  // 当前页的数据
    let prevPage = pages[pages.length - 2];  // 上一页的数据

    this.setData({
      active: Number(options.statusId != null?options.statusId:0),
      _openid:_openid,
      shop_id:prevPage.data.shopdata._id
    });
    if(this.data.active==0){
      this.getGoodsList(0)
    }
    
      // this.getGoodsList(this.data.active)

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
    this.getGoodsList(this.data.orderStatus)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})