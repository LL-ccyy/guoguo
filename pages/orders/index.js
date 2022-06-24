// pages/orders/index.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const orderList=wx.cloud.database().collection("order-list")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedID : null,
    cancelBoxShow:false,
    com: 'yunda',
    number: '432579255479713',
    _openid:"",
    tabs: ["全部","待付款","待发货","待收货","待评价","已成交","售后中"],
    active: 0,            //tab当前活动
    active0: 0,            //拉起物流页
    orderList: [],
    cancelReasons: [      //取消原因
      "",
      "地址填写错误", 
      "不想要了", 
      "商品错选/多选", 
      "商品降价", 
      "没用/少用/错用优惠", 
      "商家原因（已协商）", 
      "其他"
    ], 
    value:"",
    value2:"",
    collapseActiveNames: '0',
    cancelResIndexSelected:null,
    cancelResSelected:"",
    otherRes:"",
    moreDes:"",
    userHasSelectRes:false,
    show: false,
    show_step: [{
        text: ' ',
        desc: ' '
      },
      {
        text: '送至' + ' ' + ' ',
        desc: ' ' + ' ' + ' '
      }
    ],

    inputData: {
      input_value: "", //输入框的初始内容
      value_length: 0, //输入框密码位数
      isNext: true, //是否有下一步的按钮
      get_focus: true, //输入框的聚焦状态 
      focus_class: true, //输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6], //输入框格子数
      height: "112rpx", //输入框高度
      width: "600rpx", //输入框宽度
      see: true, //是否明文展示
      interval: false, //是否显示间隔格子 
    },

  },
  getExpressInfo() {
    var com = this.data.com
    var number = this.data.number
    let that = this
    wx.request({
      url: 'https://route.showapi.com/2650-3?com=' + com + '&nu=' + number + '&showapi_appid=1004559&showapi_sign=6329f1c06290432cb9a21abf6c4c87ab',
      data: {
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        // success
        console.log("success", res)
        let showapi_res_code = res.data.showapi_res_error ///showapi平台返回的错误码，0为成功
        let showapi_res_body = res.data.showapi_res_body
        if (showapi_res_code == 0) {
          let flag = showapi_res_body.msg //物流信息是否获取成功
          let status = showapi_res_body.ret_code //状态 -1 待查询 0 查询异常 1 暂无记录 2 在途中 3 派送中 4 已签收 5 用户拒签 6 疑难件 7 无效单 8 超时单 9 签收失败 10 退回
          // 101 揽件
          // 102 在途中
          // 103 派送中
          // 104 已签收 (完结状态)
          // 105 用户拒签
          // 106 疑难件
          // 107 无效单 (完结状态) 
          // 108 超时单
          // 109 签收失败
          // 110 退回
          // 111 转投
          // 112 待签
          let data = showapi_res_body.data //具体快递路径信息
          let steps = []
          if (flag == "查询成功") {
            for (var i = 0; i < data.length; i++) {
              let obj = {
                text: data[i].context,
                desc: data[i].time
              }
              steps.push(obj)
            }
            that.data.show_step[0]=steps[0]
            that.setData({
              steps: steps,
              active0: 0,
              show_step:that.data.show_step,
              status:status
            })
          } else {
            wx.showToast({
              title: showapi_res_body.msg,
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          //showapi平台返回的错误信息
          wx.showToast({
            title: showapi_res_code,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        // fail
        console.log("fail", res)
      }
    })
  },

  onChange(event) {
    console.log(event.detail.index)
    this.setData({
      orderList:[],
      orderStatus:event.detail.index
    })
    this.getOrderList(event.detail.index)

},

  getOrderList:function(orderStatus){
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.orderList.length
    let that = this;
    if(orderStatus==0){
      orderList.where({
        _openid : that.data._openid
      })
      .skip(len)
      .get({
        success: function(res) {
          console.log("now is the whole database:",res.data)
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
        _openid : that.data._openid
      })
      .skip(len)
      .get({
        success: function(res) {
          console.log("now is ",res.data)
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
    
  },

  send(e,n){
    var date = new Date();
    var strDate = date.getDate().toString();
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    if(n==1){
      wx.cloud.callFunction({
        name:"merchantOrder",
        data:{
          openid:this.data.orderList[e]._openid,
          state:'提醒发货',
          detail:this.data.orderList[e].goodsList[0].headline.substring(0, 7)+'...',
          price:this.data.orderList[e].realPayment.toFixed(2)+'元',
          time:year+'-'+month+'-'+strDate,
          more:'配送方式：'+this.data.orderList[e].deliveryMethod
        }
      }).then(res => {
        console.log("推送消息成功", res)
      }).catch(res => {
        console.log(res)
      })
    }
    else if(n==2){
      console.log(e);
      console.log(this.data.orderList[e]);
      wx.cloud.callFunction({
        name:"merchantOrder",
        data:{
          openid:this.data.orderList[e]._openid,
          state:'确认收货',
          detail:this.data.orderList[e].goodsList[0].headline.substring(0, 7)+'...',
          price:this.data.orderList[e].realPayment.toFixed(2)+'元',
          time:year+'-'+month+'-'+strDate,
          more:'配送方式：'+this.data.orderList[e].deliveryMethod
        }
      }).then(res => {
        console.log("推送消息成功", res)
      }).catch(res => {
        console.log(res)
        console.log("13566");
      })
    }
  },

  cancelOrder(e){
    let that = this
    this.setData({
      selectedID:e.currentTarget.id,
    })
    Dialog.confirm({
      message: '您确定取消此订单吗？',
      zIndex:500
    })
      .then(() => {
        // on confirm
        // console.log(that.data.moreDes)
        orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
          data:{
            orderStatus:7,
            cancelStatus:"已取消"
          },
          success: function(res) {
            console.log(res.data)
            Toast.success('已取消');
            that.setData({
              active:1
            })
            that.getOrderList(1)
          }
        })
      })
      .catch(() => {
      });
  },

  refond(e) {
    this.setData({
      selectedID:e.currentTarget.id,
      cancelBoxShow:true
    })
    // Dialog.confirm({
    //   message: '您确定取消此订单吗？',
    // })
    //   .then(() => {
    //     // on confirm
    //   })
    //   .catch(() => {
    //     // on cancel
    //   });
  },

  onChangeCollapse(event) {
    this.setData({
      collapseActiveNames: event.detail,
    });
  },

  selectcancelRes(e){
    console.log(e.detail)
    this.setData({
      cancelResIndexSelected:e.detail.index,
      cancelResSelected:e.detail.value,
      userHasSelectRes:true
    })
  },

  InputOtherReason(e){
    console.log(e.detail)
    this.setData({
      otherRes:e.detail
    })
  },

  InputMoreDes(e){
    this.setData({
      moreDes:e.detail
    })
  },

  cancelBtn(){
    let that=this
    let cancelReason=this.data.cancelResSelected
    if(this.data.cancelResIndexSelected==7){
      cancelReason=cancelReason+' + '+this.data.otherRes
    }
    console.log(cancelReason)
    Dialog.confirm({
      message: '您确定取消此订单吗？',
      zIndex:500
    })
      .then(() => {
        // on confirm
        // console.log(that.data.moreDes)
        orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
          data:{
            orderStatus:6,
            cancelReason:cancelReason,
            cancelDescription:that.data.moreDes,
            cancelStatus:"取消中"
          },
          success: function(res) {
            console.log(res.data)
            Toast.success('已向商家发出请求');
            that.setData({
              cancelBoxShow:false,
              value:"",
              value2:"",
              collapseActiveNames: '0',
              cancelResIndexSelected:null,
              cancelResSelected:"",
              otherRes:"",
              userHasSelectRes:false,
              active:6
            })
            that.getOrderList(6)
          }
        })
      })
      .catch(() => {
        // on cancel
        that.setData({
          cancelBoxShow:false,
          value:"",
          value2:"",
          collapseActiveNames: '0',
          cancelResIndexSelected:null,
          cancelResSelected:"",
          otherRes:"",
          userHasSelectRes:false,
        })
      });
  },

  onPayBtn(e){
    this.setData({
      selectedID:e.currentTarget.id,
      payShow:true
    })
  },

  onClose1(){
    this.setData({
        payShow:false
    });
  },

  inputClick(e) {
    this.data.inputData.input_value = e.detail
    this.setData({
      inputData: this.data.inputData
    })
  },

  payNow(){
    let that=this
    this.setData({
        payShow:false
    });
    const toast = Toast.loading({
      duration: 0, // 持续展示 toast
      forbidClick: true,
      message: '请稍候',
      selector: '#custom-selector',
    });
    
    let second = 1;
    const timer = setInterval(() => {
      second--;
      if (second) {
        toast.setData({
          message: "请稍候",
        });
      } else {
        clearInterval(timer);
        orderList.doc(that.data.orderList[that.data.selectedID]._id).update({
          data:{
            orderStatus:2,
          },
          success: function(res) {
            console.log(res.data)
            that.getOrderList(1)
            Toast.clear();
            Toast.success('支付成功');
          }
        })
      }
    }, 1000);   
    
  },

  tixingfahuo(e) {
    this.setData({
      selectedID:e.currentTarget.id
    })
    this.send(e.currentTarget.id,1)
    Toast.success('已为您催促商家');
  },
  navToOrderDetail(e){
    wx.navigateTo({
      url: '../trans_final/trans_final?id='+e.currentTarget.id,
    })
  },
  
  
  received(e){
    console.log(e)
    let that=this
    Dialog.confirm({
      title: '确认收货',
      message: '确定您已收到货物了吗？',
    })
      .then(() => {
        console.log(e.currentTarget.dataset.index);
        this.send(e.currentTarget.dataset.index,2)
        // on confirm
        orderList.doc(e.currentTarget.id).update({
          // data 传入需要局部更新的数据
          data: {
            // 表示将 done 字段置为 true
            orderStatus: 4
          },
          success: function(res) {
            Toast.success('已确认收货');
            that.getOrderList(3);
          }
        })
      })
      .catch(() => {
        // on cancel
      });
  },

  navToWuliu(e) {
    console.log(e.currentTarget.dataset.addr.addr);
    console.log(e.currentTarget.dataset.addr.name);
    console.log(e.currentTarget.dataset.addr.phone);
    var show_step=this.data.show_step
    show_step[1]=
    {
      text: '送至' + ' ' + e.currentTarget.dataset.addr.addr,
      desc: e.currentTarget.dataset.addr.name + ' ' + e.currentTarget.dataset.addr.phone
    }
    this.setData({
      show: true
    });
    this.getExpressInfo()
  },

  onClose() {
    this.setData({
      show: false
    });
  },


  evaluate(e){
    wx.navigateTo({
      url: '../evaluate/evaluate?id='+e.currentTarget.id,
    })
  },

  onClosecancelBox(){
    this.setData({
      cancelBoxShow:false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _openid=wx.getStorageSync('userOpenid');
    this.setData({
      active: Number(options.statusId),
      _openid:_openid
    });
    this.getOrderList(this.data.active)

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