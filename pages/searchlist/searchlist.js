// pages/sousuolist/sousuolist.js
// 直接搜索出结果，输空白不出结果
// 两个搜索内容加空格进行or的模糊搜索，使用正则表达式避免连续两个空格带来的分割问题
// 最多可进行三个内容的or搜索
// 两个内容加'+'进行&的模糊搜索，由于+的显示比空格明显，所以排除俩+可能
// 可以增加聚合查询
const db = wx.cloud.database();//初始化数据库
const _ = db.command
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 按某标准分类
    standard1:' ',
    sort1:' ',
    standard2:' ',
    sort2:' ',
    option1: [
      { text: '默认排序', value: 0 },
      { text: '价格降序', value: 1 },
      { text: '价格升序', value: 2 },
      { text: '好评降序', value: 3 },
      { text: '好评生序', value: 4 }
    ],
    option2: [
      { text: '销量排序', value: 'a' },
      { text: '销量升序', value: 'b' },
      { text: '销量降序', value: 'c' },
    ],
    value1: 0,
    value2: 'a',
    // searchRecord: [],
    searchVal: "",
    goods:[],
    goodList:[]
  },

  changeLeft(e){
    console.log(e);
    if(e.detail==0)
    {
      this.setData({
        standard1:' ',
        sort1:' ',
        goodList:[]
      })
    }
    else if(e.detail==1){
        this.setData({
          standard1:'price',
          sort1:'desc',
          goodList:[]
        })
    }
    else if(e.detail==2){
      this.setData({
        standard1:'price',
        sort1:'asc',
        goodList:[]
      })
    }
    else if(e.detail==3){
      this.setData({
        standard1:'star',
        sort1:'desc',
        goodList:[]
      })
    }
    else if(e.detail==4){
    this.setData({
      standard1:'star',
      sort1:'asc',
      goodList:[]
    })
    }
    this.Sort(this.data.standard1,this.data.sort1,this.data.standard2,this.data.sort2)
  },
      changeRight(e){
        console.log(e);
        if(e.detail=='a')
        {
          this.setData({
            standard2:' ',
            sort2:' ',
            goodList:[]
          })
        }
        else if(e.detail=='b'){
            this.setData({
              standard2:'cal_num',
              sort2:'asc',
              goodList:[]
            })
        }
        else if(e.detail=='c'){
          this.setData({
            standard2:'cal_num',
            sort2:'desc',
            goodList:[]
          })
      }
      this.Sort(this.data.standard1,this.data.sort1,this.data.standard2,this.data.sort2)
      },


      onChange(e) {
        this.setData({
          value: e.detail,  
          inputVal:e.detail
        });
      },

  onClick: function(e) {
    let that=this
    console.log(e);
    wx.getStorage({
      key: 'searchRecord',
      success (res) {
        console.log(res.data)    
        let searchRecord = res.data //取搜索历史
        var inputVal = that.data.inputVal;
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
            that.setData({
              searchRecord:searchRecord
            })
          } else {
            searchRecord.pop() //删掉时间最早的一条
            searchRecord.unshift(inputVal)
            that.setData({
              searchRecord:searchRecord
            })
          }
          
          //将历史记录数组储存到本地缓存中
          wx.setStorageSync('searchRecord', searchRecord)
    
        }
        that.click()
      }
    })
  },
      getHistorySearch: function() {
        this.setData({
          searchRecord: wx.getStorageSync('searchRecord') || [] //若无存储则为空
        })
      },


  click_image:function(option) {
    console.log(option.currentTarget.id)
    db.collection('goods').doc(option.currentTarget.id).update({
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
  url: '../goods_detail/index?id='+option.currentTarget.id,
})
  },


  goToShop:function(option) {
    console.log(option)
    wx.navigateTo({
      url: '../store/index?shop_id='+option.currentTarget.id,
    })
  },


    getHistorySearch: function() {
      this.setData({
        searchRecord: wx.getStorageSync('searchRecord') || [] //若无存储则为空
      })
    },
    click(){
      this.setData(
       this.data.goodList=[]
      )
      this.search()
    },
  search: function () {
    
    let that=this

    wx: wx.showLoading({
      title: '加载中',
      mask: true
    })
    var goodList=this.data.goodList
    let len=this.data.goodList.length


    // 数据库正则对象
    db.collection('goods').where({
      headline: db.RegExp({
        regexp: this.data.value,//做为关键字进行匹配
        options: 'i',//不区分大小写
        goodsStatus:1
      })
    })
    .skip(len)
    .get().then(res => {
      console.log("1",res)
      if(res.data.length){
      for (var i = 0; i < res.data.length; i++) {
        let goodsItem=res.data[i]
        // console.log("this goods shopid is ",goodsItem.shop_id)
        db.collection('shops').doc(goodsItem.shop_id).get({
          success:function(resShopInfo){
            console.log('get shopinfo',resShopInfo)
            goodsItem.shop_name=resShopInfo.data.shop_name
            goodList.push(goodsItem)
            that.setData({
              goodList:goodList
            })
          }
        })
          
        wx.hideLoading();
      }
    }
    else{
      wx.hideLoading();
      wx.showToast({
        title: '已经到底了哦',
      })
      console.log("222");
    }
    }).catch(err => {
      console.error(err)
      wx.hideLoading();
    })
  },

  Sort(standard1,sort1,standard2,sort2){
    var that=this
    var goodList=this.data.goodList
    let len=this.data.goodList.length
    wx.showLoading({
      title: '加载中',
      mask: true
    })
      // 数据库正则对象
      db.collection('goods').where({
        headline: db.RegExp({
          regexp: this.data.value,//做为关键字进行匹配
          options: 'i',//不区分大小写
          goodsStatus:1
        })
      })
      .orderBy(standard1,sort1)
      .orderBy(standard2,sort2)
      .skip(len)
      .get().then(res => {
        console.log("1",res)
        if(res.data.length){
          var GoodList=res.data
          var count=0
          GoodList.forEach(item=>{
            db.collection('shops').doc(item.shop_id).get({
              success:function(res){
                count++;
                item.shop_name=res.data.shop_name
                console.log("count=",count);
                console.log("length=",GoodList.length);
                if(count==GoodList.length){
                  console.log(count);
                  console.log(GoodList.length);
                  that.setData({
                    goodList:GoodList
                  })
                }
              }
            })
              
            wx.hideLoading();
          })
      }
      else{
        wx.hideLoading();
        wx.showToast({
          title: '已经到底了',
        })
      }
      }).catch(err => {
        console.error(err)
        wx.hideLoading();
      })
      
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHistorySearch()
    this.setData({
      value:options.value
    })
    this.click()
  },
  // SortByPrice(){
  //   db.collection('goods').where({
  //     headline: db.RegExp({
  //       regexp: '西瓜',//做为关键字进行匹配
  //       options: 'i',//不区分大小写
  //     })
  //   })
  //   .orderBy(' ',' ')
  //   .orderBy('price','desc')
  //   .get().then(res => {
  //     console.log("1w",res)})
  // },
  
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
    if(this.data.sort1==' '&&this.data.sort2==' '){
      this.search()
    }
    this.Sort(this.data.standard1,this.data.sort1,this.data.standard2,this.data.sort2)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})