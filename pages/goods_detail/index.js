// index.js
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const cart=wx.cloud.database().collection("cart");
const favourite=wx.cloud.database().collection("favourite")
const shops=wx.cloud.database().collection("shops")
const commentslist = wx.cloud.database().collection("comments")
const user = wx.cloud.database().collection("users-data-basic")

Page({
  data: {
    comesFromStore:false,     //防止用户在详情页和店铺反复横跳
    star: "star-o",
    id: "",
    good: {},
    shopID:"",
    shopName:"",
    shopOpenid:'',
    selectedgoodsList:[],     //生成订单前传入的已选择商品列表 元素包括商品id、商品size、商品数量
    selectedIndex : 0,
    sortDetail :"请选择",
    sortPrice : 0 ,
    selectedAmount : 1,
    selectBoxShow : false,
    userHasSelectSort : false ,
    userTappedAdd : false , //检测用户按下了是加入购物车还是立即购买 false为立即购买 
    shopInfo:undefined
  },

 onLoad:  async function(options) {
    const db = wx.cloud.database();
    let id = 0;
    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined') {
        id = scene;
    } else {
        id = options.id;
    }
    var comesFromStore=decodeURIComponent(options.comesFromStore)
    if (comesFromStore != 'undefined') {
      comesFromStore = options.comesFromStore;
      this.setData({
        comesFromStore:comesFromStore
      })
    }
    this.setData({
        id: id, // 这个是商品id
        valueId: id,
    });
    let that=this;
  await  db.collection('goods').doc(id).get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log("sucess:",res.data);
        that.setData({
          good:res.data
        });
        if(res.data.sort.length===1&&res.data.sort[0].detail===''){
          console.log("no sort")
          that.setData({
            userHasSelectSort:true,
            selectedIndex:0
          })
        }
        that.setData({
          sortDetail:that.data.good.sort[that.data.selectedIndex]["detail"],
          sortPrice:that.data.good.sort[that.data.selectedIndex]["price"]
        })
        shops.doc(res.data.shop_id).get({
          success:function(resShopInfo){
            that.setData({
              shopInfo:resShopInfo.data,
              shopID:resShopInfo.data._id,
              shopName:resShopInfo.data.shop_name,
              shopOpenid:resShopInfo.data._openid,
            })
          }
        })

      }
    })
    favourite.where({
      goodsid:this.data.id
    }).get({
      success(res){
        console.log(res);
        if(res.data.length){
            that.setData({
              favor_id:res.data[0]._id,
              star:'star'
            })
          }
          
      }
  })
  commentslist.where({
    goodsid  : this.data.id
  }).count().then(res => {
    this.setData({
      comments:res.total
    })
    })
    this.searchgoodsid()
  },
  searchgoodsid() {
    var that = this; //这句不能少，在查询时
    var goodsid = this.data.id;
      commentslist.where({
        goodsid: goodsid, //查询条件
      })
      .get({
        success: res => {
          console.log('查询成功', res.data[0]);
          //将查询返回的结果赋值给本地变量
          that.setData({
            commentsTemp: res.data[0],
          })
          user.where({
            _openid:res.data[0]._openid
          })
          .get({
            success(res){
              console.log(res.data[0].userInfo);
              that.setData({
                commentsTempImg: res.data[0].userInfo.avatarUrl,
                commentsTempNickName: res.data[0].userInfo.nickName,
              })
            }
          })
        },
        fail: res => {
          console.log(res)
        }
      })
    
  },  
  previewCommentsImg(e){
    console.log(e.currentTarget.dataset.url)
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    }) 
  },


  previewImage(e){
    console.log(e.currentTarget.dataset.src)
    wx.previewImage({
      urls: [e.currentTarget.dataset.src] // 需要预览的图片http链接列表
    }) 
  },

  navToOrderPage() {
    if(this.data.userHasSelectSort){
      this.setData({
        selectedgoodsList:[
          {
            headline    : this.data.good.headline,
            thumbnail   : this.data.good.thumbnail,
            sortTitle   : this.data.good.sort[this.data.selectedIndex]["sort-title"],
            sortDetail  : this.data.good.sort[this.data.selectedIndex]["detail"],
            sortPrice   : this.data.good.sort[this.data.selectedIndex]["price"],
            promotion   : this.data.good.promotion,
            mount       : this.data.selectedAmount,
            goodsid       : this.data.id,
            sortIndex     : this.data.selectedIndex,
            shopID        : this.data.shopID,
            shopName      : this.data.shopName,
            shopOpenid    : this.data.shopOpenid
          }
        ]
      })
      let strToNext=JSON.stringify(this.data.selectedgoodsList)
      console.log("即将前往下一页，传出信息为：",strToNext)
      wx.navigateTo({
        url: '../pay/index?goodsList='+strToNext, 
      })
    }
    else{
      this.setData({
        selectBoxShow:true,
        userTappedAdd:false
      })
    }
  },

  navToStorePage() {
    if(this.data.comesFromStore){
      wx.navigateBack({
        delta: 1,
      })
    }
    else{
      wx.navigateTo({
        url: '../store/index?shop_id='+this.data.good.shop_id,
      })
    }
  },

  navToChat(){
    console.log(typeof(this.data.shopInfo.chatAccount))
    if(typeof(this.data.shopInfo.chatAccount) !== 'undefined'){
      if(this.data.shopInfo.chatAccount!==''){
        wx.navigateTo({
          url: `../chat/chat?chatTo=${this.data.shopInfo.chatAccount}&chatToAccountLogo=${this.data.shopInfo.largePics}&comesFromStoreSys=false`,
        })
      }
      else{
        Toast.fail("商家暂未注册聊天账号")
      }
    }
    else{
      Toast.fail("商家暂未注册聊天账号")
    }
  },

  navToCommentsPage() {
    wx.navigateTo({
      url: '../comments/comments?id='+this.data.id,
    })
  },

  callService(){
    
  },

  addToCart(){
    if(this.data.good.sort.length===1&&this.data.good.sort[0].detail===''){
      console.log("no sort")
      this.setData({
        userTappedAdd:true
      })
      this.afterSelect()
    }
    else{
      this.setData({
        selectBoxShow:true,
        userTappedAdd:true
      })
    }
      
  },

  onClose() {
    this.setData({ selectBoxShow: false });
  },

  openCartPage: function() {
    wx.switchTab({
        url: '/pages/cart/index',
    });
  },

  goIndexPage: function() {
    wx.switchTab({
        url: '/pages/index/index',
    });
  },

  changeSelectedIndex:function(e){
    console.log(e);
    this.setData({
      selectedIndex:e.currentTarget.id,
      sortDetail:this.data.good.sort[e.currentTarget.id]["detail"],
      sortPrice:this.data.good.sort[e.currentTarget.id]["price"]
    })
  },
  onStar() {
    if(this.data.star=='star-o'){
    favourite.add({
      data:{
        goodsid:this.data.id,
      },
      success(res){
        Toast.success('加入收藏成功');
        console.log("添加成功")
      },
      fail(res){
        console.log("添加失败")
        Toast.success('加入收藏失败'+res);
      }
    })
  }
  else if(this.data.star=='star'){
    favourite.where({
      goodsid:this.data.id
    }).get({
      success(res){
        favourite.doc(res.data[0]._id).remove({
          success(res){
            console.log(res);
            Toast.success('移出收藏成功');
          },
          fail(res){
            console.log(res);
            Toast.success('移出收藏失败');
          }
        })
      }
    })
}
  this.setData({
    star: this.data.star === "star-o" ? "star" : "star-o"
  })
  },

  onSelectedNumChange(e){
    console.log(e)
    this.setData({
      selectedAmount:e.detail
    })
  },

  afterSelect(){
    if(this.data.userTappedAdd){
      this.setData({
        userHasSelectSort:true
      })
      let that=this
      cart.where({                              //先判断是否存在相同的商品与分类
        goodsid:that.data.id,
        size:that.data.selectedIndex
      }).get({
        success(res){
          console.log(res)                           
          if(res.data.length==1){                //若有 仅改变数字
            let old_data = res.data[0];
            cart.doc(old_data._id).update({
              data : {
                num : old_data.num+that.data.selectedAmount
              },
              success: function(res) {
                Toast.success('加入购物车成功');
                console.log("num has changed",res);
                that.setData({
                  selectBoxShow:false
                })
              }
            })
          }
          else if(res.data.length==0){           //没有则添加  
            console.log("there is no more same sort, retuen:",res)
            cart.add({
              data:{
                goodsid:that.data.id,
                num:that.data.selectedAmount,
                size:that.data.selectedIndex
              },
              success(res){
                Toast.success('加入购物车成功');
                console.log("添加成功")
                that.setData({
                  selectBoxShow:false
                })
              },
              fail(res){
                console.log("添加失败")
                Toast.success('加入购物车失败'+res);
              }
            })
          }
          else{                                  //重复数据需要联系管理员删除
            console.log("添加失败 购物车有重复数据")
            Toast.success('加入购物车失败 请联系数据库管理员');
          }
        },
        fail(res){
        }
      })
    }
    else{
      this.setData({
        userHasSelectSort:true,
        selectBoxShow:false
      })
      this.setData({
        selectedgoodsList:[
          {
            headline      : this.data.good.headline,
            thumbnail     : this.data.good.thumbnail,
            sortTitle     : this.data.good.sort[this.data.selectedIndex]["sort-title"],
            sortDetail    : this.data.good.sort[this.data.selectedIndex]["detail"],
            sortPrice     : this.data.good.sort[this.data.selectedIndex]["price"],
            promotion     : this.data.good.promotion,
            mount         : this.data.selectedAmount,
            goodsid       : this.data.id,
            sortIndex     : this.data.selectedIndex,
            shopID        : this.data.shopID,
            shopName      : this.data.shopName,
            shopOpenid    : this.data.shopOpenid
          }
        ]
      })
      let strToNext=JSON.stringify(this.data.selectedgoodsList)
      console.log("即将前往下一页，传出信息为：",strToNext)
      wx.navigateTo({
        url: '../pay/index?goodsList='+strToNext, 
      })
    }
  },

    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from == 'button') { 
      return {
        title: '【菓菓集市】'+this.data.good.headline,
        path: `/pages/goods_detail/index?id=${this.data.good._id}`,  
        imageUrl:this.data.good.thumbnail,
        success: (res) => {   
          console.log('分享成功',res);
        },
        fail: function(res){
          console.log('分享失败',res);
        },
      }
    }
  }

})