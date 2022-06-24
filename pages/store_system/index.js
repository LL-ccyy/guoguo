// pages/orders_Merchant/index.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const orderList=wx.cloud.database().collection("order-list")
const goodsList=wx.cloud.database().collection("goods")
const shopinfo = wx.cloud.database().collection("shops")

let app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addOrEditStoreShow  : false,
    thereIsShopInfo     : false,
    unpayed             : 0,
    unsent              : 0,
    refund              : 0,
    onsale              : 0,
    removed             : 0, 
    img                 : '',
    shopdata            : {},
    ifchangeMedia       : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userOpenid=wx.getStorageSync('userOpenid');

    let that=this
    console.log(userOpenid)
    shopinfo.where({
      _openid: userOpenid
    }).get({
      success: function(res) {
        console.log("store info:",res.data.length)
        if(res.data.length>=1){
          // console.log("yes")
          that.setData({
            shopdata:res.data[0],
            thereIsShopInfo:true,
            img:res.data[0].largePics,
            NickName:res.data[0].shop_name
          })
          
          that.getOrderDtNGoodsDt()
        }
        else{
          that.setData({
            thereIsShopInfo:false
          })
        }
      },
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 1
    })
  }
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

  },
  
  goToMyShop(){
    wx.navigateTo({
      url: '../store/index',
    })
  },

  showEnditBox(){
    this.setData({
      addOrEditStoreShow:true
    })
  },

  onCloseAES(){
    this.setData({
      addOrEditStoreShow:false
    })
    this.onLoad()
  },

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

  inputname(e){
    console.log(e.detail);
    this.setData({
      NickName:e.detail
    })
  },

  changeimg(){
    wx.chooseMedia({
      count: 1,
      mediaType: 'image',
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
          this.setData({
            img:res.tempFiles[0].tempFilePath,
            ifchangeMedia:1
          })
      }
    })
  },
  changename(){
    var that=this
    shopinfo.doc(this.data.shopdata._id).set({
      data: {
        shop_name:this.data.NickName,
        largePics:this.data.img
      },
      success(res) {
        console.log(res);
        console.log("修改成功");
      },
      fail(res) {
        console.log(res);
        console.log("修改失败");
      }
    })
    wx.showToast({
      title: '修改成功',
      icon: 'success',
      duration: 800
    })
    setTimeout(() => {
      that.setData({
        addOrEditStoreShow: false
      })
      that.onLoad()
    }, 800);
  },

  changeOrUpload(){
    if(this.data.thereIsShopInfo){
      if(this.data.ifchangeMedia){
        this.changeMedia()
      }
      else{
        this.changename()
      }
    }
    else{
      this.uploadMedia()
    }
  },

  async uploadMedia() {
    // wx.showLoading({
    //   title: '发布中...',
    // })
    let that=this
    var extension = null
    var media = this.data.media

      if (this.data.img) {
        extension = this.data.img.split('.').pop();
      }
      await new Promise((resolve, reject) => {
        // this.uploadfile(extension, this.data.imgList[i])
        wx.cloud.uploadFile({
          cloudPath: 'shopinfo/' + new Date().getTime() + '.' + extension,
          filePath: this.data.img, // 文件路径
          success: res => {
            media = res.fileID
            this.setData({
              media: media
            })
            resolve(res)
          },
          fail: err => {
            // handle error
            reject(err)
          }
        })
      }).then(res => {
          this.upload_othcom()
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 800
          })
          setTimeout(() => {
            that.setData({
              addOrEditStoreShow:false
            })
            that.onLoad()
          }, 800);
      });

  },

  upload_othcom() {
    shopinfo.add({
      data: {
        shop_name   : this.data.NickName,
        largePics   : this.data.media
      },
      success(res) {
        console.log(res);
        console.log("添加成功");
      },
      fail(res) {
        console.log(res);
        console.log("添加失败");
      }
    })
  },

  async changeMedia() {
    // wx.showLoading({
    //   title: '发布中...',
    // })
    let that=this
    var extension = null
    var media = this.data.media
    
    wx.cloud.deleteFile({
      fileList: [that.data.shopdata.largePics]
    }).then(res => {
      // handle success
      console.log("delete Success: ",res.fileList)

    }).catch(error => {
      // handle error
    })

      if (this.data.img) {
        extension = this.data.img.split('.').pop();
      }
      await new Promise((resolve, reject) => {
        // this.uploadfile(extension, this.data.imgList[i])
        wx.cloud.uploadFile({
          cloudPath: 'shopinfo/' + new Date().getTime() + '.' + extension,
          filePath: this.data.img, // 文件路径
          success: res => {
            media = res.fileID
            this.setData({
              media: media
            })
            resolve(res)
          },
          fail: err => {
            // handle error
            reject(err)
          }
        })
      }).then(res => {
          this.change_othcom()
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 800
          })
          setTimeout(() => {
            that.setData({
              addOrEditStoreShow:false
            })
            that.onLoad()
          }, 800);
      });

  },

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

  change_othcom(){
    var that=this
    shopinfo.doc(this.data.shopdata._id).set({
      data: {
        shop_name   : this.data.NickName,
        largePics   : this.data.media
      },
      success(res) {
        console.log(res);
        console.log("修改成功");
        that.setData({
          ifchangeMedia:0
        })
      },
      fail(res) {
        console.log(res);
        console.log("修改失败");
      }
    })
  },

  change111(){
    let s=this.data.shopdata.largePics
    console.log("aaa:",s.slice(s.indexOf("shopinfo/"),s.length))
  },

  goToOrders(e){
    console.log(e.currentTarget)
    wx.navigateTo({
      url: '../orders_merchant/index?statusId='+e.currentTarget.id, 
    })
  },

  goToGoods(e){
    console.log(e.currentTarget)
    wx.navigateTo({
      url: '../mygoods/mygoods?statusId='+e.currentTarget.id, 
    })
  },

  addGoods(){
    wx.navigateTo({
      url: '../store_system/good_set/index?shop_id='+this.data.shopdata._id, 
    })
  },

  getOrderDtNGoodsDt(){
    let that=this
    orderList.where({
      merchantid  : that.data.shopdata._id,
      orderStatus : 1
    }).count().then(res=>{
      that.setData({
        unpayed:res.total
      })
    })
    orderList.where({
      merchantid  : that.data.shopdata._id,
      orderStatus : 2
    }).count().then(res=>{
      that.setData({
        unsent:res.total
      })
    })

    orderList.where({
      merchantid  : that.data.shopdata._id,
      orderStatus : 6
    }).count().then(res=>{
      that.setData({
        refund:res.total
      })
    })

    goodsList.where({
      shop_id  : that.data.shopdata._id,
      goodsStatus:1
    }).count().then(res => {
      that.setData({
        onsale:res.total
      })
      })
      goodsList.where({
        shop_id  : that.data.shopdata._id,
        goodsStatus:2
      }).count().then(res => {
        that.setData({
          down:res.total
        })
        })

    
  },


  signOut(){
    wx.redirectTo({
      url: '../start/start',
    })
  },

  policyBoxClick(e){
    // console.log(e)
    wx.navigateTo({
      url: '../shangjia/index/index?index='+e.currentTarget.id,
    })
  }

})