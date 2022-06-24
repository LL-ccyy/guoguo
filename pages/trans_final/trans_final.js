// pages/trans_final/trans_final.js
// 界面需要传入的信息包括快递公司，物流单号，经纬度
// 将起始点的存为 this.data.start_long，终止点的end_longitude
const orderList=wx.cloud.database().collection("order-list")
var QQMapWX = require('../../qqmap-wx-jssdk.js');
var qqmapsdk;
//汽车速度假设为一小时50公里，折合为1秒13.89米约等于14米
var speed = 14;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    end_longitude:'116.214458',
    end_latitude:'39.9739',
    com: 'yunda',
    number: '432579255479713',
    // 分界
    route: [],
    longitude: '',
    latitude: '',
    orderNumber: "", //快递单号
    index: 0,
    isShow: 0, //是否显示物流信息
    evaluation: 0,
    steps: [],
    show_step: [{
        text: ' ',
        desc: ' '
      },
      {
        text: '送至' + ' ' + ' ',
        desc: ' ' + ' ' + ' '
      }
    ],
    showExp:false,
    active: 0,
    j:-1,
    orderList:[],
    subAllAmount:0,
    goodsSubTotalPrice:0,
    whole_polyline:[]
  },

  getOrderList:function(orderid){
    let that = this;
      orderList.doc(orderid).get({
        success: function(res) {
          console.log("now is ",res.data)
          that.setData({
            orderList:res.data,
          })
          console.log("已发货？",(res.data.orderStatus>=3)&&(res.data.orderStatus<=5))
          if((res.data.orderStatus>=3)&&(res.data.orderStatus<=5)){ 
            //3-已发货（待收货） 4-已成交（待评价） 5-已成交（已评价）
            //否则不显示物流信息
            that.setData({showExp:true})
            var item;
            let goodsSubTotalPrice=that.data.goodsSubTotalPrice
            let subAllAmount=that.data.subAllAmount
            var show_step=that.data.show_step
            show_step[1]=
              {
                text: '送至' + ' ' + that.data.orderList.addrInfo.addr,
                desc: that.data.orderList.addrInfo.name + ' ' + that.data.orderList.addrInfo.phone
              }
            for(item in that.data.orderList.goodsList){
              goodsSubTotalPrice+=that.data.orderList.goodsList[item].sortPrice*that.data.orderList.goodsList[item].mount;
              subAllAmount+=that.data.orderList.goodsList[item].mount
            }
            that.setData({
              subAllAmount:subAllAmount,
              goodsSubTotalPrice:goodsSubTotalPrice,
              show_step:show_step
            })
            that.getExpressInfo()
          }
          else{
            that.setData({showExp:false})
          }
          
        }
      })
    
  },

  // 地理位置转为经纬度
  place2ll(place) {
    var latitude = this.data.latitude
    var longitude = this.data.longitude
    var _this = this;
    //调用地址解析接口
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: place, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) { //成功后的回调
        console.log(res);
        var res = res.result;
        var latitude = res.location.lat;
        var longitude = res.location.lng;
        //根据地址解析在地图上标记解析地址位置
        _this.setData({ // 获取返回结果，放到markers及poi中，并在地图展示
          latitude: latitude,
          longitude: longitude
        });

      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  // 经纬度设置
  // 存储的数据包括经纬度，所以不需要把地址转为经纬度的操作
  // ll() {
  //   var start_place = this.data.start_place
  //   var end_place = this.data.end_place
  //   var end_longitude = this.data.end_longitude
  //   var end_latitude = this.data.end_latitude
  //   this.place2ll(start_place)
  //   setTimeout(() => {
  //     this.setData({
  //       start_longitude: this.data.longitude,
  //       start_latitude: this.data.latitude
  //     })
  //     this.place2ll(end_place)
  //   }, 500);
  //   setTimeout(() => {
  //     this.setData({
  //       end_longitude: this.data.longitude,
  //       end_latitude: this.data.latitude
  //     })
  //   }, 1000);
  // },

  includePoints() {
    // 如果在路上，显示当前位置到目的地的路段
    if(this.data.arrive_ll){
    var arrive_long=this.data.arrive_ll.split(',')[0]
    var arrive_lati=this.data.arrive_ll.split(',')[1]
    this.pointer.includePoints({
      padding: [10],
      points: [{
        latitude: arrive_lati,
        longitude: arrive_long
      }, {
        latitude: this.data.end_latitude,
        longitude: this.data.end_longitude
      }]
    })
  }
  else{
        // 如果已签收，显示全部路段
    // var arrive_long=this.data.arrive_ll.split(',')[0]
    // var arrive_lati=this.data.arrive_ll.split(',')[1]
    this.pointer.includePoints({
      padding: [10],
      points: [{
        latitude: this.data.start_lati,
        longitude: this.data.start_long
      }, {
        latitude: this.data.end_latitude,
        longitude: this.data.end_longitude
      }]
    })
  }
  },
  whole_routing(){
    var start_long = this.data.start_longitude;
    var start_lati = this.data.start_latitude;
    var end_long = this.data.end_longitude;
    var end_lati = this.data.end_latitude;
    var _this = this;
    //调用距离计算接口
    qqmapsdk.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: {
        latitude: start_lati,
        longitude: start_long
      },
      to: {
        latitude: end_lati,
        longitude: end_long
      },
      speed: speed,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#CCFFCC',
            width: 4
          }]
        })
        // _this.pointer.includePoints({
        //   padding: [10],
        //   points: [{
        //     latitude: _this.data.start_latitude,
        //     longitude: _this.data.start_longitude
        //   }, {
        //       latitude: _this.data.end_latitude,
        //       longitude: _this.data.end_longitude
        //   }]
        // })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  // routing(start_long,start_lati,end_long,end_lati){
  routing() {
    var polyline=[]
    // 出发地到所在地的路径显示
    // var start_long = this.data.orderList.addrInfo.longitude
    // var start_lati = this.data.orderList.addrInfo.latitude
    var start_long = this.data.start_long
    var start_lati = this.data.start_lati
    var end_longitude=this.data.end_longitude
    var end_latitude=this.data.end_latitude
    if(this.data.arrive_ll){
      var arrive_long=this.data.arrive_ll.split(',')[0]
      var arrive_lati=this.data.arrive_ll.split(',')[1]
      var _this = this;
      console.log(arrive_long);
    //调用距离计算接口
    qqmapsdk.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: {
        latitude: start_lati,
        longitude: start_long
      },
      to: {
        latitude: arrive_lati,
        longitude: arrive_long
      },
      speed: speed,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polylines: [{
            points: pl,
            color: '#29A58D',
            width: 6
          }],
          markers: [{
            iconPath: "../../images/arrive.png",
            longitude:arrive_long,
            latitude:arrive_lati,
            id: 0,
            width: 34,
            height: 49
          }]
        })
        polyline.push(_this.data.polylines[0])
        _this.setData({
          polyline: polyline
        })
        // var polylines=_this.data.polylines
        // polyline.push([])
        // if(polyline.length==2){
        //   polyline[1]=polylines[0]
        //   _this.setData({
        //     polyline:polyline
        //   })
        // }
        // else{
        //   polyline.pop()
        //   polyline[1]=polylines[0]
        //   _this.setData({
        //     polyline:polyline
        //   })
        // }
        // _this.pointer.includePoints({
        //   padding: [10],
        //   points: [{
        //     latitude: _this.data.start_latitude,
        //     longitude: _this.data.start_longitude
        //   }, {
        //       latitude: _this.data.end_latitude,
        //       longitude: _this.data.end_longitude
        //   }]
        // })
        // _this.includePoints()
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
    qqmapsdk.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: {
        latitude: arrive_lati,
        longitude: arrive_long
      },
      to: {
        latitude: end_latitude,
        longitude: end_longitude
      },
      speed: speed,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          _polyline: [{
            points: pl,
            color: '#CCFFCC',
            width: 4
          }]
        })
        polyline.push(_this.data._polyline[0])
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  }
  else{
    // var start_long = this.data.orderList.addrInfo.longitude
    // var start_lati = this.data.orderList.addrInfo.latitude
    var start_long = this.data.start_long
    var start_lati = this.data.start_lati
    var end_longitude=this.data.end_longitude
    var end_latitude=this.data.end_latitude
    console.log("start_long",start_long);
    console.log("end_longitude",end_longitude);
    var _this = this;
    qqmapsdk.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: {
        latitude: start_lati,
        longitude: start_long
      },
      to: {
        latitude: end_latitude,
        longitude: end_longitude
      },
      speed: speed,
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polylines: [{
            points: pl,
            color: '#29A58D',
            width: 6
          }],
          markers: [{
            iconPath: "../../images/arrive.png",
            longitude:end_longitude,
            latitude:end_latitude,
            id: 0,
            width: 80,
            height: 80
          }]
        })
        polyline.push(_this.data.polylines[0])
        _this.setData({
          polyline: polyline
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  }
  },
  //文本框失去焦点事件
  bindblurInput: function (e) {
    console.log(e.detail.value)
    this.data.orderNumber = e.detail.value
  },
  //点击城市组件确定事件
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
    this.data.expAbbr = this.data.expAbbrs[e.detail.value]
  },


  /**
   * 阿里云api接口获取快递物流信息
   *  com:物流公司字母简称,(如不知道快递公司名，可以使用 auto 代替)
   *  number:快递单号
   */
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
          let arrive_ll = ''
          let arrive_place = ''
          if (flag == "查询成功") {
            for (var i = 0; i < data.length; i++) {
              let obj = {
                text: data[i].context,
                desc: data[i].time
              }
              steps.push(obj)
            }
            arrive_ll = data[0].location
            arrive_place = data[0].address
            that.data.show_step[0]=steps[0]
            that.setData({
              steps: steps,
              active: 0,
              arrive_ll: arrive_ll,
              arrive_place: arrive_place,
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
  trans_show() {
    this.setData({
      isShow: 1
    })
  },
 async map_show() {
    this.setData({
      isShow: 2
    })
   await this.routing()
    this.includePoints()
  },
  back() {
    this.setData({
      isShow: 0
    })
  },
  confirm() {
    this.setData({
      evaluation: 1,
      j:0
    })
    this.eva()
    this.getOpenid()
  },
  eva() {
    wx.navigateTo({
      url: '/pages/evaluate/evaluate'
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderid:options.id
    })
    qqmapsdk = new QQMapWX({
      key: 'R4ABZ-EQ6L6-E7CS3-EKTXV-OO6I5-VZBFX'
    })
    this.getOrderList(this.data.orderid)

    // this.getExpressInfo()
    
    // this.whole_routing()
  },
  // 获取用户的订阅消息授权
  author(){
    wx.requestSubscribeMessage({
      tmplIds: ['AFccig_fx12nT9SLuk2pii71qv9fKNwFaAEf-_WW5ek'],
      success (res) {
        console.log("授权成功",res)
      },
      fail(res){
        console.log("授权失败",res)
      }
    }
    )
  },
  // 获取用户的openid授权并发送订阅消息
  getOpenid(){
    wx.cloud.callFunction({
      name: "getOpenid"
    }).then(res => {
      let openid = res.result.openid
      console.log("获取openid成功", openid)
      this.send(openid)
    }).catch(res => {
      console.log("获取openid失败", res)
    })
  },
  send(openid){
    var j=this.data.j
    wx.cloud.callFunction({
      name:"send",
      data:{
        openid:openid,
        state:this.data.state[j]
      }
    }).then(res => {
      console.log("推送消息成功", res)
    }).catch(res => {
      console.log('res')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.pointer = wx.createMapContext('myMap')
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