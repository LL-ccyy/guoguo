// pages/orders_Merchant/index.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const orderList=wx.cloud.database().collection("order-list")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    merchantID:"",
    _openid:"",
    tabs: ["全部","待付款","待发货","待收货","已完成","售后中"],
    active: 0,            //tab当前活动
    orderList: [],
    selectedID:"",
    sentBoxShow:false,
    handleBoxShow:false,
    expNames: ["申通", "顺丰", "圆通", "中通", "韵达", "天天", "京东", "EMS", "宅急送", "百世", "四通一达"], //物流公司
    expAbbrs: ["shentong", "shunfeng", "yuantong", "zhongtong", "yunda", "tiantian", "jingdong", "ems", "zhaijisong", "baishi", "sitongyida"],
    collapseActiveNames: '0',
    expIndexSelected:null,
    expNameSelected:"申通",
    expNum : "",
    userHasSelectExp:false,
    sentCheck:false,
  },

  send(){
    console.log("111");
    var date = new Date();
    var strDate = date.getDate().toString();
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    wx.cloud.callFunction({
      name:"deliver",
      data:{
        openid:this.data.orderList[this.data.selectedID]._openid,
        expNameSelected:this.data.expNameSelected+'快递',
        expNum:this.data.expNum,
        name:this.data.orderList[this.data.selectedID].goodsList[0].headline.substring(0, 7)+'...',
        time:year+'-'+month+'-'+strDate
      }
    }).then(res => {
      console.log("推送消息成功", res)
    }).catch(res => {
      console.log(res)
    })
  },

  onChangeCollapse(event) {
    this.setData({
      collapseActiveNames: event.detail,
    });
  },

  selectExpNames(e){
    console.log(e.detail)
    this.setData({
      expIndexSelected:e.detail.index,
      expNameSelected:e.detail.value,
      userHasSelectExp:true
    })
    console.log("expAbbrs:",this.data.expAbbrs[this.data.expIndexSelected])
  },

  InputExpNum(e){
    console.log(e.detail)
    this.setData({
      expNum:e.detail
    })
  },

  onChangeSentCheck(e){
    this.setData({
      sentCheck: e.detail,
    });
  },

  onChange(event) {
    console.log("change event",event.detail.index)
    if(event.detail.index==5){ 
      this.setData({
        orderList:[],
        orderStatus:event.detail.index
      })
      this.getOrderList(6)
    }
    else{
      this.setData({
        orderList:[],
        orderStatus:event.detail.index
      })
      this.getOrderList(event.detail.index)
    }
},

  getOrderList:function(orderStatus){
    console.log("orderStatus is ",orderStatus)
    this.setData({
      orderList:[]
    })
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.orderList.length
    const _ = wx.cloud.database().command
    console.log("merchantID:",this.data.merchantid)
    let that = this;
    if(orderStatus==0){
      orderList.where({
        merchantid : that.data.merchantid
      })
      .skip(len)
      .get({
        success: function(res) {
          // console.log("now is the whole database:",res.data)
          that.setData({
            orderList:that.data.orderList.concat(res.data)
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
    else if(orderStatus==4){
      orderList.where({
        orderStatus : _.in([4, 5]),
        merchantid : that.data.merchantid
      })
      .skip(len)
      .get({
        success: function(res) {
          // console.log("now is ",res.data)
          that.setData({
            orderList:that.data.orderList.concat(res.data)
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
      orderList.where({
        orderStatus : orderStatus,
        merchantid : that.data.merchantid
      })
      .skip(len)
      .get({
        success: function(res) {
          // console.log("now is ",res.data)
          console.log("before is ",that.data.orderList)
          that.setData({
            orderList:that.data.orderList.concat(res.data)
          })
          console.log("after is ",that.data.orderList)
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

  cancelOrder() {
    Dialog.confirm({
      message: '您确定取消此订单吗？',
    })
      .then(() => {
        // on confirm
      })
      .catch(() => {
        // on cancel
      });
  },

  sentClick(e){
    console.log(e)
    this.setData({
      selectedID:e.currentTarget.id,
      sentBoxShow:true
    })
  },

  handleRefond(e){
    console.log(e)
    this.setData({
      selectedID:e.currentTarget.id,
      handleBoxShow:true
    })
  },


  onCloseSentBox(){
    this.setData({
      sentBoxShow:false
    })
  },

  onCloseHandleBox(){
    this.setData({
      handleBoxShow:false
    })
  },

  agreeRefond(){
    let that = this
    Dialog.confirm({
      message: '您确定同意退款吗？',
      zIndex:500
    }).then(() => {
        // on confirm
        orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
          data:{
            orderStatus:7,
            cancelStatus:"已退款"
          },
          success: function(res) {
            console.log(res.data)
            Toast.success('已退款');
            that.setData({
              handleBoxShow:false,
              active:5
            })
            that.getOrderList(6)
          }
        })
      }).catch(() => {
      });
  },

  tixingfukuan() {
    Toast.success('已为您提醒买家');
  },

  navToWuliu(e) {
    console.log(e)
    wx.navigateTo({
      url: '../trans_final/trans_final?id='+e.currentTarget.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _openid=wx.getStorageSync('userOpenid');
    let pages = getCurrentPages();  // 当前页的数据
    let prevPage = pages[pages.length - 2];  // 上一页的数据

    this.setData({
      orderList:[],
      active: Number(options.statusId != null?options.statusId:0),
      _openid:_openid,
      merchantid:prevPage.data.shopdata._id
    });
    
    if(this.data.active===0){
      this.getOrderList(0)
    }

    // if(this.data.active==5){ 
    //   this.getOrderList(6)
    // }
    // else{
    //   this.getOrderList(this.data.active)
    // }

  },

  sentBtn(){
    this.send()
    let that=this
    orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
      data:{
        orderStatus:3,
        expAbbr : that.data.expAbbrs[that.data.expIndexSelected],
        epxNum : parseInt(that.data.expNum)
      },
      success: function(res) {
        console.log(res.data)
        Toast.success('发货成功');
        that.setData({
          sentBoxShow:false,
          orderList:[],
          active:2
        })
        that.getOrderList(2)
      }
    })
  },

  sentBtnWithoutInfo(){
    this.send()
    let that=this
    orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
      data:{
        orderStatus:3,
      },
      success: function(res) {
        console.log(res.data)
        Toast.success('发货成功');
        that.setData({
          sentBoxShow:false,
          active:0
        })
        that.getOrderList(0)
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
    this.getOrderList(this.data.orderStatus)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})