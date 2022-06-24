// pages/star/index.js
// 上个界面传去shop_id
const goods_list = wx.cloud.database().collection("goods")
const shopinfo = wx.cloud.database().collection("shops")
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg_color: "45deg, white 100%,  #80cac3 50%",
    value: 5,
    active: 'home',
    shop_id: 'f6e08a64629080cc056a9f911728c001',
    goodList: [],
    shopinfo: '',
    option1: [{
        text: '默认排序',
        value: 0
      },
      {
        text: '价格降序',
        value: 1
      },
      {
        text: '价格升序',
        value: 2
      },
      {
        text: '好评降序',
        value: 3
      },
      {
        text: '好评升序',
        value: 4
      }
    ],
    option2: [{
        text: '库存排序',
        value: 'a'
      },
      {
        text: '库存升序',
        value: 'b'
      },
      {
        text: '库存降序',
        value: 'c'
      },
    ],
    value1: 0,
    value2: 'a',
    standard1: ' ',
    standard2: ' ',
    sort1: ' ',
    sort2: ' ',
    show: false,
    activeKey: 0,
    fruitTypes: [
      "全部", "橘子", "猕猴桃", "西瓜", "柠檬", "苹果", "梨", "菠萝", "香蕉", "百香果", "其他"
    ],
    selectTag: ' '
  },

  onSideBarChange: function (e) {
    const db = wx.cloud.database(); //初始化数据库
    console.log(e);
    let that = this;
    if (e.detail != 0) {
      that.setData({
        selectTag: that.data.fruitTypes[e.detail],
        goodList:[]
      })
    } else {
      that.setData({
        selectTag: ' ',
        goodList:[]
      })
    }
    this.Sort(this.data.standard1, this.data.sort1, this.data.standard2, this.data.sort2)
  },

  showPopup() {
    this.setData({
      show: true
    });
  },

  onClose() {
    this.setData({
      show: false
    });
  },

  changeLeft(e) {
    console.log(e);
    if (e.detail == 0) {
      this.setData({
        standard1: ' ',
        sort1: ' ',
        goodList:[]
      })
    } else if (e.detail == 1) {
      this.setData({
        standard1: 'price',
        sort1: 'desc',
        goodList:[]
      })
    } else if (e.detail == 2) {
      this.setData({
        standard1: 'price',
        sort1: 'asc',
        goodList:[]
      })
    } else if (e.detail == 3) {
      this.setData({
        standard1: 'star',
        sort1: 'desc',
        goodList:[]
      })
    } else if (e.detail == 4) {
      this.setData({
        standard1: 'star',
        sort1: 'asc',
        goodList:[]
      })
    }
    this.Sort(this.data.standard1, this.data.sort1, this.data.standard2, this.data.sort2)
  },
  changeRight(e) {
    console.log(e);
    if (e.detail == 'a') {
      this.setData({
        standard2: ' ',
        sort2: ' ',
        goodList:[]
      })
    } else if (e.detail == 'b') {
      this.setData({
        standard2: 'num',
        sort2: 'asc',
        goodList:[]
      })
    } else if (e.detail == 'c') {
      this.setData({
        standard2: 'num',
        sort2: 'desc',
        goodList:[]
      })
    }
    this.Sort(this.data.standard1, this.data.sort1, this.data.standard2, this.data.sort2)
  },

  Sort(standard1, sort1, standard2, sort2) {
    wx.showLoading({
      title: '加载中',
    })
    var goodList=this.data.goodList
    var len=this.data.goodList.length
    var that = this
    if (this.data.selectTag != ' ') {
      db.collection('goods').where({
          shop_id: this.data.shop_id,
          tag: this.data.selectTag,
          goodsStatus:1
        })
        .orderBy(standard1, sort1)
        .orderBy(standard2, sort2)
        .skip(len)
        .get().then(res => {

          that.setData({
            goodList: goodList.concat(res.data)
          })
          wx.hideLoading({
          })
          if(res.data==0){
            wx.showToast({
              title: '已经到底了',
            })
          }
        }).catch(err => {
          console.error(err)
          wx.hideLoading();
        })
    } else {
      db.collection('goods').where({
          shop_id: this.data.shop_id,
          goodsStatus:1
        })
        .orderBy(standard1, sort1)
        .orderBy(standard2, sort2)
        .skip(len)
        .get().then(res => {
          that.setData({
            goodList: goodList.concat(res.data)
          })
          wx.hideLoading({
          })
          if(res.data==0){
            wx.showToast({
              title: '已经到底了',
            })
          }
        }).catch(err => {
          console.error(err)
          wx.hideLoading();
        })
    }
    this.setData({
      show: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      shop_id:options.shop_id
    })
    await this.getshop(options.shop_id)
    this.getgoods()
  },

  getshop(id) {
    var that = this
    console.log("id is ",id)
    shopinfo.where({
      _id: id
    })
    .get({
      success(res) {
          console.log(res);
        if (res.data.length) {
          that.setData({
            shopinfo: res.data[0]
          })
        }
        that.storescore()
      }
    })
  },

  getgoods() {
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.goodList.length
    let that=this
    var goodList = this.data.goodList
    goods_list.where({
      shop_id: this.data.shop_id,
      goodsStatus:1
    })
    .skip(len)
    .get({
      success(res) {
        console.log(res);
        if (res.data.length) {
          for (var i = 0; i < res.data.length; i++) {
            goodList.push(res.data[i])
          }
          console.log(goodList);
          that.setData({
            goodList: goodList
          })
        }
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

  click_image: function (option) {
    console.log(option)
    wx.navigateTo({
      url: '../goods_detail/index?id=' + option.currentTarget.id + '&comesFromStore=true',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  storescore(){
    const $ = db.command.aggregate
    var that=this
    db.collection('goods').aggregate()
    .group({
      _id: '$shop_id',
      // star: $.divide([$.sum($.multiply(['$cal_num', '$star'])), $.sum('$cal_num')]),
      all_num:$.sum('$cal_num'),
      whole_star:$.push('$star'),
      whole_num:$.push('$cal_num')
    })
  .end({
    success: function(res) {
      console.log(res.list)
      console.log(that.data.shopinfo._id);
      res.list.forEach(item=>{
        if(item._id==that.data.shopinfo._id){
          console.log(item);
          var allstar=0
          for(var i=0;i<item.whole_num.length;i++){
            allstar+=item.whole_num[i]*item.whole_star[i]
          }
          that.setData({
            allstar:Math.floor(allstar/item.all_num)
          })
        }
      })
    },
    fail: function(err) {
      console.error(err)
    }
  })
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
    if (this.data.selectTag == ' '&&this.data.sort1&&this.data.sort2) {
      this.getgoods()
    }
    else{
      this.Sort(this.data.standard1, this.data.sort1, this.data.standard2, this.data.sort2)
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})