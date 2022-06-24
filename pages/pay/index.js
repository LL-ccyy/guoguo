// index.js

import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const cart=wx.cloud.database().collection("cart");
const orderList=wx.cloud.database().collection("order-list")
const goodList = wx.cloud.database().collection("goods")

const _ = wx.cloud.database().command


// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[],
    shopsList:[],
    userHasChosenAddr:false,
    addrInfo:{},
    totalPrice:0,
    customerMessage:"",
    comesFromCart:false,
    ordernum : 'D6214'+Math.random().toString().slice(-14),
    cartIDList:[],
    payShow:false,
    paySucessShow:false,
    deliveryMethod:"快递",
    offlineTradeEn:false,
    patMeth:"微信支付",

    activeNames: '0',
    radio: '1',
    activeNames2: '0',
    radio2: '1',

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openid=wx.getStorageSync('userOpenid')
    this.setData({
      openid:openid
    })
    if(options.comesFromCart){
      let shopsListTemp=(JSON.parse(options.goodsList));
      var totalPrice=0
      console.log("shopsListTemp:",shopsListTemp);
      for(var i=0;i<shopsListTemp.length;i++){
        var item;
        var goodsListTemp = shopsListTemp[i].goodsList
        let goodsSubTotalPrice = 0
        let subAllAmount = 0
        for(item in goodsListTemp){
          goodsSubTotalPrice += goodsListTemp[item].sortPrice*goodsListTemp[item].mount;
          subAllAmount += goodsListTemp[item].mount
        }
        shopsListTemp[i].goodsSubTotalPrice=goodsSubTotalPrice
        shopsListTemp[i].subAllAmount=subAllAmount
        totalPrice += goodsSubTotalPrice
      }
      
      this.setData({
        shopsList:shopsListTemp,
        totalPrice:totalPrice
      });
  
      let cartIDList=JSON.parse(options.cartID)
      console.log("cartID:",cartIDList)
      this.setData({
        comesFromCart : true,
        cartIDList : cartIDList
      })
    }
    else{
      let goodsListTemp1=(JSON.parse(options.goodsList));
      console.log("goodsList is",goodsListTemp1)
      let shopsListTemp=[{
        goodsList : goodsListTemp1,
        shopID : goodsListTemp1[0].shopID,
        shopName : goodsListTemp1[0].shopName,
        shopOpenid:goodsListTemp1[0].shopOpenid
      }]
      var totalPrice=0
      console.log("shopsListTemp:",shopsListTemp);
      for(var i=0;i<shopsListTemp.length;i++){
        var item;
        var goodsListTemp = shopsListTemp[i].goodsList
        let goodsSubTotalPrice = 0
        let subAllAmount = 0
        for(item in goodsListTemp){
          goodsSubTotalPrice += goodsListTemp[item].sortPrice*goodsListTemp[item].mount;
          subAllAmount += goodsListTemp[item].mount
        }
        shopsListTemp[i].goodsSubTotalPrice=goodsSubTotalPrice
        shopsListTemp[i].subAllAmount=subAllAmount
        totalPrice += goodsSubTotalPrice
      }
      
      this.setData({
        comesFromCart : false,
        shopsList:shopsListTemp,
        totalPrice:totalPrice
      });
    }

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
    // console.log("now AddrInfo is:",this.data.addrInfo)
    // console.log("now userHasChosenAddr is:",this.data.userHasChosenAddr)
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
    
  },

  onChangeCollapse(event) {
    this.setData({
      activeNames: event.detail,
    });
  },

  onChangeRadio(event) {
    this.setData({
      radio: event.detail,
    });
  },

  onClickRadio(event) {
    const { name } = event.currentTarget.dataset;
    if(name=='1'){
      this.setData({
        deliveryMethod : "快递",
        offlineTradeEn : false
      })
    }
    else{
      this.setData({
        deliveryMethod : "线下自提",
        offlineTradeEn : true
      })
    }
    this.setData({
      radio: name,
      activeNames: '2',
    });
  },

  onChangeCollapse2(event) {
    this.setData({
      activeNames2: event.detail,
    });
  },

  onChangeRadio2(event) {
    this.setData({
      radio2: event.detail,
    });
  },

  onClickRadio2(event) {
    const { name } = event.currentTarget.dataset;
    if(name=='1'){
      this.setData({
        patMeth : "微信支付"
      })
    }
    else if(name=='2'){
      this.setData({
        patMeth : "支付宝支付"
      })
    }
    else{
      this.setData({
        patMeth : "线下支付"
      })
    }
    this.setData({
      radio2: name,
      activeNames2: '2',
    });
  },

  customerMsgChange:function(e){
    let shopListTemp=this.data.shopsList
    console.log(e)
    shopListTemp[e.currentTarget.id].customerMessage=e.detail
    this.setData({
      shopsList:shopListTemp
    })
  },

  author(){
    wx.requestSubscribeMessage({
      tmplIds: ['o1OjpuW9aS-ydJzTOzhMskxs4fNaDFvCEEdXxYsRzcE','-QMcOGDntUjSHj4CZhAWBrRCmTC9JeE30bubf5P9_ew'],
      success (res) {
        console.log("授权成功",res)
      },
      fail(res){
        console.log("授权失败",res)
      }
    }
    )
  },

  onSubmit(){
    this.setData({
        payShow:true
    })
    this.author()
  },

  inputClick(e) {
    this.data.inputData.input_value = e.detail
    this.setData({
      inputData: this.data.inputData
    })
  },

  onClose1(){
    this.setData({
        payShow:false
    });
    let that = this
    this.data.shopsList.forEach(shopItem=>{
      that.uploadOrderData(shopItem,1)
    })
    this.delectCart()
    this.otherOperation()
    // wx.redirectTo({ 
    //   url: '../trans_final/trans_final?id=' + 
    // });
  },

  send(){
    var date = new Date();
    var strDate = date.getDate().toString();
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    wx.cloud.callFunction({
      name:"send",
      data:{
        openid:this.data.openid,
        name:this.data.shopsList[0].goodsList[0].headline.substring(0, 7)+'...',
        price:this.data.totalPrice.toFixed(2),
        date:year+'-'+month+'-'+strDate,
        more:'配送方式：'+this.data.deliveryMethod,
        templateId:'o1OjpuW9aS-ydJzTOzhMskxs4fNaDFvCEEdXxYsRzcE'
      }
    }).then(res => {
      console.log("推送消息成功", res)
    }).catch(res => {
      console.log(res)
    })
    for(var i=0;i<this.data.shopsList.length;i++){
      wx.cloud.callFunction({
        name:"merchantOrder",
        data:{
          openid:this.data.shopsList[i].shopOpenid,
          state:'新订单',
          detail:this.data.shopsList[i].goodsList[0].headline.substring(0, 7)+'...',
          price:this.data.shopsList[i].goodsSubTotalPrice.toFixed(2)+'元',
          time:year+'-'+month+'-'+strDate,
          more:'配送方式：'+this.data.deliveryMethod
        }
      }).then(res => {
        console.log("推送消息成功", res)
      }).catch(res => {
        console.log(res)
      })
    }

  },

  payNow(){
    this.setData({
        payShow:false
    });
    this.send()
    const toast = Toast.loading({
      duration: 0, // 持续展示 toast
      forbidClick: true,
      message: '请稍候',
      selector: '#custom-selector',
    });
    
    let that=this

    let second = 1;
    const timer = setInterval(() => {
      second--;
      if (second) {
        toast.setData({
          message: "请稍候",
        });
      } else {
        clearInterval(timer);
        Toast.clear();
        Toast.success('支付成功');

        that.data.shopsList.forEach(shopItem=>{
          that.uploadOrderData(shopItem,2)
        })
        that.delectCart()
        that.otherOperation()
        // wx.redirectTo({ 
        //   url: '../trans_final/trans_final?id=' + 
        // });
      }
    }, 1000);   
    
  },

  /******************************************************
   *  生成订单并上传数据库
   *  传入订单状态  
   *  status: 1-待付款，2-已付款（待发货），3-已发货（待收货），
   *          4-已成交（待评价），5-已成交（已评价）6-退款
   ******************************************************/
  uploadOrderData:function(shopItemData,status){
    let orderDataToUpload = {
      time              : new Date().toLocaleString(),
      orderStatus       : status,
      merchantid        : shopItemData.shopID,
      marchantName      : shopItemData.shopName,
      mechantOpenid     : shopItemData._openid,
      goodsList         : shopItemData.goodsList,
      addrInfo          : this.data.addrInfo,
      customerMessage   : shopItemData.customerMessage,
      ordernum          : 'D6214'+Math.random().toString().slice(-14),
      deliveryMethod    : this.data.deliveryMethod,
      paymeth           : this.data.patMeth,
      realPayment       : shopItemData.goodsSubTotalPrice
    };
    console.log("orderDataToUpload : ",orderDataToUpload);

    let that=this;
    orderList.add({
      data : orderDataToUpload
    }).then(res => {
      console.log(res._id);
      if(that.data.comesFromCart){  //从购物车页来的就直接回去
        wx.navigateBack({
          delta: 1,
        })
      }
      else{                         //否则重定向到订单页
        wx.redirectTo({ 
          url: '../trans_final/trans_final?id=' + res._id
        });
      }
    })
  },

  delectCart(){
    let that=this;
    if(that.data.comesFromCart){
      var items1;
      for(items1 in that.data.cartIDList){
        cart.doc(that.data.cartIDList[items1]).remove({
          success: function(res) {
            console.log("remove sucess:",res)
          },
          fail: function(res){
            console.log("remove fail:",res)
          }
        })
      }
    }

  },

  otherOperation(){
    for(var i = 0 ; i<this.data.shopsList.length;i++){
      let thisShopItem = this.data.shopsList[i]
      console.log("now is",thisShopItem)
      for(var j = 0 ; j<thisShopItem.goodsList.length;j++){
        let thisGoodsItem = thisShopItem.goodsList[j]
        console.log("now is",thisGoodsItem)
        this.goodsIncraseSold(thisGoodsItem.goodsid,thisGoodsItem.mount)
      }
    }
  },

  goodsIncraseSold(goodsID,increaseNum){
    //商品库存、购买人数操作
    goodList.doc(goodsID).update({
      data:{
        "sold":_.inc(increaseNum)
      }
    })
  }

})