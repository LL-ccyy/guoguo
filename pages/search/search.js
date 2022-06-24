// pages/sousuo/sousuo.js
const db = wx.cloud.database();//初始化数据库
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 存放商品链接
    value: '',   
    inputVal: '',
    searchRecord: [],
    searchVal: "",
    //搜索过后商品列表
    goodList:[],
    icons:["/images/1.png",
    "/images/2.png",
    "/images/3.png",
    "/images/4.png",
    "/images/5.png",
    "/images/6.png"]
  },
  naviToDetail(e){
    console.log(e.currentTarget.id);
    db.collection('goods').doc(this.data.SearchList[e.currentTarget.id]._id).update({
      data: {
        click: _.inc(1)
      },
      success: function(res) {
        console.log("win",res)
      },
      fail:function(res){
        console.log(res);
      }
    })
    wx.navigateTo({
      url: '../goods_detail/index?id='+this.data.SearchList[e.currentTarget.id]._id
    })
  },

  onChange(e) {
    this.setData({
      value: e.detail,  
      inputVal:e.detail
    });
  },
  // onClick() {
  //   Toast('搜索' + this.data.value);
  // },  
  //取得本地储存函数 在生命周期函数onload中调用
  getHistorySearch: function() {
    this.setData({
      searchRecord: wx.getStorageSync('searchRecord') || [] //若无存储则为空
    })
  },

  //点击垃圾桶图标清空历史搜索记录
  hisDel: function() {
    wx.clearStorageSync('searchRecord')
    this.setData({
      searchRecord: []
    })
  },

  deleteSingleHis:function(e){
    var inputVal = e.currentTarget.id;
    var searchRecord = this.data.searchRecord;
    console.log("在",searchRecord,"中删除",inputVal);
    searchRecord.splice(searchRecord.indexOf(inputVal),1)
    this.setData({
      searchRecord : searchRecord
    })
  },

  //提交表单并存储搜索内容
  onClick: function(e) {
    console.log(e);
    var inputVal = this.data.inputVal;
    var searchRecord = this.data.searchRecord;
    console.log(inputVal,searchRecord)
    console.log(searchRecord.includes(inputVal))
    if(!inputVal) {
      //输入为空时的处理
      return false
    } else {
      if(searchRecord.includes(inputVal)){
        //有就删掉 再加入
        searchRecord.splice(searchRecord.indexOf(inputVal),1)
      }
      //将输入值放入历史记录中，放前8条
      if(searchRecord.length < 8) {
        searchRecord.unshift(inputVal)
        this.setData({
          searchRecord:searchRecord
        })
      } else {
        searchRecord.pop() //删掉时间最早的一条
        searchRecord.unshift(inputVal)
        this.setData({
          searchRecord:searchRecord
        })
      }
      
      //将历史记录数组储存到本地缓存中
      wx.setStorageSync('searchRecord', searchRecord)
    }
    this.redirect()
  },

  //商品关键字模糊搜索

  redirect(){
    wx.redirectTo({
      url: '/pages/searchlist/searchlist?value='+this.data.value
    })
  },

  onClickHistory(e){
    console.log("clicked history :",this.data.searchRecord[e.currentTarget.id])
    this.setData({
      value     : this.data.searchRecord[e.currentTarget.id],
      inputVal  : this.data.searchRecord[e.currentTarget.id]
    })
  },

  /**
   * 生命周期函数--监听页面加载
   * 在进入页面时，检索出缓存中的历史搜索
   */


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getHistorySearch()
    wx.cloud.callFunction({
      name: 'sortSearchlist',
      complete: res => {
        console.log("查排行榜",res.result.data.slice(0,6));
        this.setData({
          SearchList:res.result.data.slice(0,6)
        })
      }
    });
    //     wx.cloud.callFunction({
    //   name: 'timer',
    // });
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})