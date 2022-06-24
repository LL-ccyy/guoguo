// 改进：读取多地址
// 下面空白
const addr_list = wx.cloud.database().collection("addr-list")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list:[],                            /*cfs 20220520.5.20 16:57 edited*/
    needToSendBackInfo:false,           /*cfs 20220520.5.20 16:57 edited*/
    showAddAddr:false,
    labelList: ["家", "公司", "学校"],
    labelDefault:0,
    tag:'家'
  },
  get_list(){
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.list.length
    var that =this
    addr_list
    .where({
      _openid : that.data._openid
    })
    .skip(len)
    .get({
      success(res){
        console.log(res);
        that.setData({
          list:that.data.list.concat(res.data)
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
  },
  Deleteaddr(e) {
      var list=this.data.list
      wx.showModal({
        title: '要删除这条地址信息吗？',
        content: '',
        cancelText: '取消',
        confirmText: '确定',
        success: res => {
          if (res.confirm) {
            var id=list[e.currentTarget.dataset.index]._id
            this.data.list.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              list: this.data.list
            })
            this.delete_list(id)
          }
        }
      })
    },
    changeaddr(e){
      var list=this.data.list
      wx.showModal({
        title: '要修改这条信息吗？',
        content: '',
        cancelText: '取消',
        confirmText: '确定',
        success: res => {
          if (res.confirm) {
             var id=list[e.currentTarget.dataset.index]._id
             var addressDetail=list[e.currentTarget.dataset.index].addressDetail
             var addressName=list[e.currentTarget.dataset.index].addressName
             var detailaddress=list[e.currentTarget.dataset.index].detailaddress
             var name=list[e.currentTarget.dataset.index].name
             var phone=list[e.currentTarget.dataset.index].phone
             var tag=list[e.currentTarget.dataset.index].tag
             var labelDefault=list[e.currentTarget.dataset.index].labelDefault
          this.setData({
            id:id,
            addressDetail:addressDetail,
            addressName:addressName,
            detailaddress:detailaddress,
            name:name,
            phone:phone,
            tag:tag,
            labelDefault:labelDefault,
            showAddAddr:true
          })
          // this.setData({

          // })
          }
        }
      })
    },
    delete_list(id){
      addr_list.doc(id).remove({
        success(res){
          console.log(res);
          console.log("删除成功");
        },
        fail(res){
          console.log(res);
          console.log("删除失败");
        }
      })
    },

  addAddress(){
    this.setData({
      id:'',
      addressDetail:'',
      addressName:'',
      detailaddress:'',
      name:'',
      phone:'',
      tag:'家',
      labelDefault:'0',
      showAddAddr:true
    })
  },

  onClose(){
    this.setData({
      showAddAddr:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /********** cfs 20220520.5.20 16:57 edited **************/
    if(options!=null){  //如果有参数传入
      console.log("last Page Sended:",options);
      if(options.needBackInfo=="true"){
        this.setData({
          needToSendBackInfo:options.needBackInfo
        });
        console.log("need to send back?",this.data.needToSendBackInfo)
      }
    }
    /*******************************************************/
  },

  /**
   * 返回数据给上一个请求页面 数据键值: addrInfo
   * 传入地址信息json
   * cfs 20220520.5.20 16:57 edited
   */
  giveBackAddrInfo:function(addrInfomation){
    let pages = getCurrentPages();  // 当前页的数据
    let prevPage = pages[pages.length - 2];  // 上一页的数据

    prevPage.setData({
      addrInfo: addrInfomation,
      userHasChosenAddr:true
    })
    /** 返回上一页 这个时候参数已经传递过去了 可以在上一页的onShow方法里把 prevPageValue 输出来查看是否已经携带完成 */
    wx.navigateBack({});
  },

  /**
   * 按下地址栏回调函数 
   * cfs 20220520.5.20 16:57 edited
   */
  choose:function(e){
    console.log(e)
    if(this.data.needToSendBackInfo){
      let addrInformation={
        id          : this.data.list[e.currentTarget.id]._id,
        name        : this.data.list[e.currentTarget.id].name,
        phone       : this.data.list[e.currentTarget.id].phone,
        addr        : this.data.list[e.currentTarget.id].addressDetail+
                      this.data.list[e.currentTarget.id].addressName+
                      this.data.list[e.currentTarget.id].detailaddress,
        tag         : this.data.list[e.currentTarget.id].tag,
        longitude   : this.data.list[e.currentTarget.id].longitude,
        latitude    : this.data.list[e.currentTarget.id].latitude
      };
      // console.log(addrInformation);
      this.giveBackAddrInfo(addrInformation)
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
    this.get_list()
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
    this.get_list()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  /*********** 以下为原address_new.js *********/
   //获取地址，详细地址，标签，收货人，手机号信息
   choosePost:function(e){
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        if(res.address!='' && res.name!=''){
          that.setData({
            addressName: res.name,
            addressDetail: res.address,
            latitude:res.latitude,
            longitude:res.longitude
          })
      }
    },
      fail: function (lb) {
        console.log('获取失败')
      }
    })
  },
  chooseLabelSelect: function(e) {
    var tag=this.data.tag
    var labelList=this.data.labelList
    console.log(e);
    var index = e.currentTarget.dataset.index;
    tag=labelList[index]
    this.setData({
      labelDefault: index,
      tag:tag
    })
  },
  getdetailaddress(e){
    console.log(e.detail.value);
    this.setData({
      detailaddress:e.detail.value
    })
  },
  getname(e){
    console.log(e.detail.value);
    this.setData({
      name:e.detail.value
    })
  },
  getphone(e){
    console.log(e.detail.value);
    this.setData({
      phone:e.detail.value
    })
  },
 
  save(){
    var id=this.data.id
    if(id){
      this.updaddlist(id)
    }
    else{
      this.add2addlist()
    }
  },
  updaddlist(id){
    var that =this
    addr_list.doc(id).update({
      data:{
        name:this.data.name,
        phone:this.data.phone,
        addressName:this.data.addressName,
        addressDetail:this.data.addressDetail,
        tag:this.data.tag,
        detailaddress:this.data.detailaddress,
        latitude:this.data.latitude,
        longitude:this.data.longitude,
        labelDefault:this.data.labelDefault,
      },
      success(res){
        console.log(res);
        console.log("更新成功");
        that.setData({
          showAddAddr:false
        })
        that.get_list()
      },
      fail(res){
        console.log(res);
        console.log("更新失败");
      }
    })
  },
  // 上传至数据库
  add2addlist(){
    var that =this
    if(this.data.name&&this.data.phone&&this.data.addressName){
      addr_list.add({
        data:{
          name:this.data.name,
          phone:this.data.phone,
          addressName:this.data.addressName,
          addressDetail:this.data.addressDetail,
          tag:this.data.tag,
          detailaddress:this.data.detailaddress,
          latitude:this.data.latitude,
          longitude:this.data.longitude,
          labelDefault:this.data.labelDefault,
        },
        success(res){
          console.log(res);
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 500
          })
          that.setData({
            showAddAddr:false
          })
          that.get_list()
        },
        fail(res){
          console.log(res);
          wx.showToast({
            title: '保存失败',
            icon: 'fail',
            duration: 500
          })
        }
      })
    }
    else if(!this.data.name){
      console.log("您未填收货人信息");
      wx.showToast({
        title: '您未填收货人信息',
        icon: 'none',
        duration: 2000
      })
    }
    else if(!this.data.phone){
      console.log("您未填手机号信息");
      wx.showToast({
        title: '您未填手机号信息',
        icon: 'none',
        duration: 2000
      })
    }
    else if(!this.data.addressName){
      console.log("您未填地址信息");
      wx.showToast({
        title: '您未填地址信息',
        icon: 'none',
        duration: 2000
      })
    }
  },


})