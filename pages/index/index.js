const db = wx.cloud.database();//初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImg: [],
    time: 30 * 60 * 60 * 1000,
    fruitTypes: [],
    goodsList: [],
    goodList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.init();
  },
  getgoodList(){
    wx.showLoading({
      title: '加载中',
    })
    let that=this;
    let len=this.data.goodList.length
    var goodList=this.data.goodList
    db.collection('goods')
    .where({
      goodsStatus:1
    })
    .skip(len)
    .get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data)
        if(res.data.length>0){
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
          wx.hideLoading({
          })
        }
        else{
          wx.hideLoading({
          })
          wx.showToast({
            title: '已经到底了',
          })
        }
      }
    })
  },

  onShow(){
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 0
    })
  }

  },

  init() {
    this.loadHomePage()
  },

  click_image:function(option) {
    console.log(option.currentTarget.id)
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

  loadHomePage() {
    this.setData({
      goodsList: [
        {
          detailUrl: "",
          imgUrl: '/images/banana.jpg',
          price: 122
        },
        {
          detailUrl: "",
          imgUrl: '/images/banana.jpg',
          price: 122
        },
        {
          detailUrl: "",
          imgUrl: '/images/banana.jpg',
          price: 122
        },
        {
          detailUrl: "",
          imgUrl: '/images/banana.jpg',
          price: 122
        },
      ],
      fruitTypes: [
        {
          imgUrl: '/images/orange.png',
          name: '橘子'
        },
        {
          imgUrl: '/images/mihoutao.png',
          name: '猕猴桃'
        },
        {
          imgUrl: '/images/watermelon.png',
          name: '西瓜'
        },
        {
          imgUrl: '/images/lemen.png',
          name: '柠檬'
        },
        {
          imgUrl: '/images/others.png',
          name: '更多'
        }
      ],
      swiperImg: [
        'cloud://cloud1-0gtwyi069b662d65.636c-cloud1-0gtwyi069b662d65-1310644662/sannong/tuoping.png',
        'cloud://cloud1-0gtwyi069b662d65.636c-cloud1-0gtwyi069b662d65-1310644662/sannong/sannong.png'
      ]
    })
    this.getgoodList()
    this.cal_star()
  },
  navToDetailPage() {
    wx.navigateTo({
      url: '../goods_detail/index',
    })
  },
  cal_star(){
    const $ = wx.cloud.database().command.aggregate
    wx.cloud.database().collection('comments').aggregate()
  
  .group({
    // 按 category 字段分组
    _id: '$goodsid',
    // 让输出的每组记录有一个 avgSales 字段，其值是组内所有记录的 sales 字段的平均值
    avgStar: $.avg('$star')
  })
  .sort({
    avgStar: -1,
  })
  .end({
    success: function(res) {
      console.log(res)
    },
    fail: function(err) {
      console.error(err)
    }
  })
  },
  
  navToFruitTypes(e) {
    const typeid = e.currentTarget.dataset.typeid;
    wx.navigateTo({
      url: `../fruit_types/index?typeid=${typeid}`,
    })
  },
  clickSearch:function() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  onReachBottom() {
this.getgoodList()
  },
})