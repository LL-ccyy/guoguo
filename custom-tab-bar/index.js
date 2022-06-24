var app = getApp();
Component({
  data: {
    selected: 0,
    color: "#000000",
    selectedColor: "#1396DB",
    allList: [{
      list1: [{
        pagePath: "/pages/index/index",
        text: "首页",
        selectedIconPath: "/images/homepage-alive.png",
        iconPath: "/images/homepage.png"
      },
      {
        pagePath: "/pages/cart/index",
        text: "购物车",
        selectedIconPath: "/images/shopping-alive.png",
        iconPath: "/images/shopping.png"
      },
      {
        pagePath: "/pages/user/index",
        text: "我的",
        selectedIconPath: "/images/mine-alive.png",
        iconPath: "/images/mine.png"
      }],
      list2: [{
        pagePath: "/pages/shangjia/index/index",
        iconPath: "/images/homepage.png",
        selectedIconPath: "/images/homepage-alive.png",
        text: "首页"
      }, {
        pagePath: "/pages/shangjia/users/users",
        iconPath: "/images/mine.png",
        selectedIconPath: "/images/mine-alive.png",
        text: "我的"
      }]
    }],

    list: app.globalData.list
  },
  attached() {

    var that = this;
    this.setData({
      list:app.globalData.list
    })
    app.changeTabbarCallback = res => {
      that.setData({
        list:res
      })
      console.log(this.data.list);
    }

  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      console.log("switchTab",e)
      let pages = getCurrentPages();
      let thisPage = pages[pages.length - 1]
      if(typeof(thisPage.data.pageIs)!=='undefined'){
        if(thisPage.data.pageIs==='chatHis'){
          thisPage.nimDisconnect()
        }
      }
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }

  
})


