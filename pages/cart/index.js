// index.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
// 获取应用实例
const cart=wx.cloud.database().collection("cart")
const goods_list=wx.cloud.database().collection("goods")
const shops=wx.cloud.database().collection("shops")

function groupBy(list,key){
  return list.reduce((rv,current)=>{
      (rv[current[key]]=rv[current[key]]||[]).push(current)
      return rv
  },{})
}

Page({

  /**
   * 页面的初始数据
   */
  data:{
    shopList:[],
    // cartGoods: [],
    cartList2:[],                     //20220602重构后list
    cartTotal: {
        "goodsCount": 0,
        "goodsAmount": 0.00,
        "checkedGoodsCount": 0,
        "checkedGoodsAmount": 0.00,
        "userId_test": ''
    },
    submitBtnEnable : false,
    isEditCart: false,
    // checkedAllStatus: true,
    // editCartList: [],
    isTouchMove: false,
    startX: 0, //开始坐标
    startY: 0,
    // hasCartGoods: 0,
    // goodslist:[],
    // tap:0,
    // 购物车点击数量
    // tap_num:0,
    ind:[],
    choose_all:0,
    all_price:0,
    selectedgoodsList:[],     //生成订单前传入的已选择商品列表 元素包括商品id、商品size、商品数量
    selectedCartID:[],
  },

  // tap(){
  //   this.setData({
  //     tap:!this.data.tap
  //   })
  // },
  chooseAll(){
    this.setData({
      choose_all:!this.data.choose_all,
    })
    let shopListTemp=this.data.shopList
    for(var i=0;i<shopListTemp.length;i++){
      for(var j=0;j<shopListTemp[i].goodsList.length;j++){
        shopListTemp[i].goodsList[j].selected=this.data.choose_all
      }
    }
    this.setData({
      shopList:shopListTemp
    })
    this.calculate()

  },

  chooseShop(e){
    let shopIndex=e.currentTarget.id
    let shopListTemp=this.data.shopList
    shopListTemp[shopIndex].selected=!shopListTemp[shopIndex].selected
    for(var i = 0; i < shopListTemp[shopIndex].goodsList.length; i++){
      shopListTemp[shopIndex].goodsList[i].selected=shopListTemp[shopIndex].selected
    }
    this.setData({
      shopList:shopListTemp
    })
    this.calculate()
  },

  tap_cart_num(e){
    // console.log(e.currentTarget);
    let shopIndex=e.currentTarget.dataset.index[0]
    let goodsIndex=e.currentTarget.dataset.index[1]
    let shopListTemp=this.data.shopList
    console.log("tap good is ",shopListTemp[shopIndex].goodsList[goodsIndex])
    shopListTemp[shopIndex].goodsList[goodsIndex].changeNum=true
    this.setData({
      shopList:shopListTemp
    })
  },

  tapStepper(){
    //空操作 防止跳转到商品页 不可注释掉此函数
  },

  tap_cart_choose(e){
    // console.log(e.currentTarget.dataset)
    let shopIndex=e.currentTarget.dataset.index[0]
    let goodsIndex=e.currentTarget.dataset.index[1]
    let shopListTemp=this.data.shopList
    // console.log(shopListTemp[shopIndex].goodsList[goodsIndex])
    if(shopListTemp[shopIndex].goodsList[goodsIndex].selected===null){
      shopListTemp[shopIndex].goodsList[goodsIndex].selected=true
    }
    else{
      shopListTemp[shopIndex].goodsList[goodsIndex].selected =! shopListTemp[shopIndex].goodsList[goodsIndex].selected
    }
    this.setData({
      shopList:shopListTemp,
    })
    this.calculate()
  },

  get_cart2(){
    wx.showLoading({
      title: '加载中',
    })
    let len=this.data.cartList2.length
    let that=this
    // this.setData({
    //   goodslist:[]
    // })
    var goodListTemp=[];
    cart
    .skip(len)
    .get({
      success(res){
        let cartListTemp=res.data
        var counter=0
        cartListTemp.forEach(cartItem => {
          // console.log("cartItemis",cartItem)
          goods_list.doc(cartItem.goodsid).get({
            success(resGoods){
              counter++;
              cartItem.goodsInfo=resGoods.data
              cartItem.shopID=resGoods.data.shop_id,
              cartItem.shopOpenid=resGoods.data._openid
              // console.log("cartItemNew",cartItem)
              goodListTemp.push(cartItem)
              if(counter === cartListTemp.length){
                //在这执行所有执行的完后的
                console.log("final cartListTemp is ",cartListTemp)
                that.setData({
                  cartList2:that.data.cartList2.concat(cartListTemp)
                })
                that.sortByShopName()
                wx.hideLoading({
                })
              }
            }
          })
        });
        setTimeout(() => {
          if(res.data==0){
            wx.hideLoading({
            })
            wx.showToast({
              title: '已经到底了',
            })
          }
        }, 1000);

      }
    })
  },

  sortByShopName(){
    let that = this
    var finalShopListTemp=[];
    let cartListArterSort=groupBy(this.data.cartList2,"shopID")
    // console.log("after sort:",cartListArterSort)
    var counter=0
    var cartListArterSort2=[]
    for (let shopItemID in cartListArterSort) {
      // 获取key值
      //  console.log("shopID is ",shopItemID); //label name
       // 获取value值
      //  console.log("shop detail",cartListArterSort[shopItemID]); //aaa bbb
       cartListArterSort2.push({
         shopID:shopItemID,
         goodsList:cartListArterSort[shopItemID]
        })
    }
    // console.log("atfter trans",cartListArterSort2)
    cartListArterSort2.forEach(cartItem => {
      // console.log("cartItemis",cartItem)
      shops.doc(cartItem.shopID).get({
        success(resshopInfo){
          counter++;
          cartItem.shopName=resshopInfo.data.shop_name
          cartItem.shopOpenid=resshopInfo.data._openid
          // console.log("cartItemNew",cartItem)
          finalShopListTemp.push(cartItem)
          if(counter === cartListArterSort2.length){
            //在这执行所有执行的完后的
            console.log("final shopListTemp is ",finalShopListTemp)
            that.setData({
              shopList:finalShopListTemp
            })
          }
        }
      })
    })
  },


  /*

  get_cart(){
    var that =this
    this.setData({
      goodslist:[]
    })
      cart.get({
        async  success(res){
          var tap_choose = new Array(res.data.length).fill(0);
          var tap_num = new Array(res.data.length).fill(0);
        console.log(res);
        that.setData({
          list:res.data,
          tap_choose:tap_choose,
          tap_num:tap_num
        })
    //     res.data.forEach((item) => {
    //       that.tap_goods_num(item.goodsid)
    // });
    for(var i=0;i<res.data.length;i++){
    // await  that.tap_goods_num(res.data[i].goodsid)
      await that.searchgoodsid(res.data[i].goodsid)
    }
      }
    })
  },

 searchgoodsid(goodsid){
      var that =this
      var goodslist=this.data.goodslist
      return new Promise((resolve, reject) => {
     console.log(goodsid);
     goods_list.doc(goodsid).get({
      success: function(res) {
        
        // res.data 包含该记录的数据
      //  console.log("111",res.data)
        goodslist.push(res.data)
        that.setData({
            goodslist:goodslist
        })
        console.log(goodslist);
        resolve(res)
      },
    })
  })
  },
  */

   tap_goods_num(goodsid){
    this.searchgoodsid(goodsid).then(res => {
      var tap_choose = new Array(this.data.list.length).fill(0);
      var tap_num = new Array(this.data.list.length).fill(0);
      this.setData({
        tap_choose:tap_choose,
        tap_num:tap_num
      })
      console.log(res)	// 输出内容：res
    }).catch(res => {
      console.log(res)	// 输出内容：'失败啦'
    })
  },

  updcartlist(id,target){
    let shopListTemp=this.data.shopList
    let shopIndex=target[0]
    let goodsIndex=target[1]
    var that =this
    cart.doc(id).update({
      data:{
        num  :  shopListTemp[shopIndex].goodsList[goodsIndex].num
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

  onChange(e){
    console.log(e)
    
    let shopIndex=e.currentTarget.dataset.index[0]
    let goodsIndex=e.currentTarget.dataset.index[1]
    let shopListTemp=this.data.shopList
    shopListTemp[shopIndex].goodsList[goodsIndex].num=e.detail
    this.setData({
      shopList:shopListTemp
    })
    var _id=shopListTemp[shopIndex].goodsList[goodsIndex]._id
    console.log("change ID is ",_id)
    this.updcartlist(_id,[shopIndex,goodsIndex])
    this.calculate()
  },

  calculate(){
    let shopListTemp=this.data.shopList
    var price=0;
    var btnAble = false;
    var allGoodsSelected=true

    var totalShopListToPay=[]
    var cartIDToPay=[] 


    for(var i=0;i<shopListTemp.length;i++){
      var shopAllSelected=true
      var goodsListToPay=[]       
      var thisShopId=shopListTemp[i].shopID
      var thisShopName=shopListTemp[i].shopName
      var thisShopOpenid=shopListTemp[i].shopOpenid
      for(var j=0;j<shopListTemp[i].goodsList.length;j++){
        // console.log("i is ",i,"j is",j,"status is",shopListTemp[i].goodsList[j].selected)
        if(shopListTemp[i].goodsList[j].selected==false||shopListTemp[i].goodsList[j].selected==null){
          shopAllSelected=false
          // break
        }
        else{
          btnAble=true
          price += shopListTemp[i].goodsList[j].num *
                    shopListTemp[i].goodsList[j].goodsInfo.sort[shopListTemp[i].goodsList[j].size].price
          
          goodsListToPay.push({
            headline      : shopListTemp[i].goodsList[j].goodsInfo.headline,
            thumbnail     : shopListTemp[i].goodsList[j].goodsInfo.thumbnail,
            sortTitle     : shopListTemp[i].goodsList[j].goodsInfo.sort[shopListTemp[i].goodsList[j].size]["sort-title"],
            sortDetail    : shopListTemp[i].goodsList[j].goodsInfo.sort[shopListTemp[i].goodsList[j].size]["detail"],
            sortPrice     : shopListTemp[i].goodsList[j].goodsInfo.sort[shopListTemp[i].goodsList[j].size]["price"],
            promotion     : shopListTemp[i].goodsList[j].goodsInfo.promotion,
            mount         : shopListTemp[i].goodsList[j].num,
            goodsid       : shopListTemp[i].goodsList[j].goodsid,
            sortIndex     : shopListTemp[i].goodsList[j].size
          })

          cartIDToPay.push(shopListTemp[i].goodsList[j]._id)
          // console.log("now cartIDToPay is ",cartIDToPay)
        }
      }
      if(shopAllSelected==false){
        allGoodsSelected=false
      }
      if(goodsListToPay.length>0){
        totalShopListToPay.push({
          goodsList:goodsListToPay,
          shopID:thisShopId,
          shopName:thisShopName,
          shopOpenid:thisShopOpenid
        })
      }
      console.log("Now total selected is ",totalShopListToPay)
      shopListTemp[i].selected=shopAllSelected
    }
    
    this.setData({
      submitBtnEnable:btnAble,
      all_price:price,
      shopList:shopListTemp,
      choose_all:allGoodsSelected,
      selectedgoodsList:totalShopListToPay,
      selectedCartID:cartIDToPay
    })

    
    // for(var i=0;i<this0.data.list.length;i++){
    //   if(this.data.tap_choose[i]&&(!btnAble)){
    //     btnAble=true
    //   }
    //   price+=this.data.tap_choose[i]*(this.data.list[i].num*this.data.goodslist[i].sort[this.data.list[i].size].price)
    // }
    // this.setData({
    //   submitBtnEnable:btnAble,
    //   all_price:price
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 1
    })
  }
  this.setData({
    shopList:[],
    cartList2:[]
  })
    // this.get_cart()
    this.get_cart2()
    this.setData({
      choose_all:0,
      all_price:0,
      submitBtnEnable:false,
    })
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
    this.get_cart2()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  onDelete : function(e){
    console.log(e)
    let goodsToDelect=e.currentTarget.id;
    let that = this
    Dialog.confirm({
      message: '确定删除此商品吗？',
    }).then(() => {
      console.log("tapped yes,id is",goodsToDelect);
      cart.doc(goodsToDelect).remove({
        success: function(res) {
          console.log(res);
          Toast.success('删除成功');
          that.onShow();
        },
        fail:function(res){
          console.log("failed",res);
          Toast.fail('删除失败');
        }
      })
    });
  },

  onClickButton:function(){
    let selectedgoodsListTemp=this.data.selectedgoodsList;
    let selectedCartID=this.data.selectedCartID
    console.log("selected list:",selectedgoodsListTemp);
    let strToNextGoods=JSON.stringify(selectedgoodsListTemp);
    let strToNextCartID=JSON.stringify(selectedCartID);
    console.log("即将前往下一页，传出信息为：",strToNextGoods)
    wx.navigateTo({
      url: '../pay/index?goodsList='+strToNextGoods+'&comesFromCart=true&cartID='+strToNextCartID, 
    })
  },
})
