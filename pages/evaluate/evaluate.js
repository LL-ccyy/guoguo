const orderList=wx.cloud.database().collection("order-list")
var app = getApp();
const commentslist=wx.cloud.database().collection("comments")
const goods=wx.cloud.database().collection("goods")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    imgList: [],
    filePath: [],
    img_up: "",
    max: 400,
    value: 0,
    media:[],
    goodsid:'',
    value:[],
    comments:[],
  },

  onChange(event) {

    console.log(event);
    this.data.value[event.currentTarget.id]=event.detail
    console.log(this.data.value);
    this.data.orderList.goodsList[event.currentTarget.id].star=((this.data.orderList.goodsList[event.currentTarget.id].avgStar*this.data.orderList.goodsList[event.currentTarget.id].cal_num)+event.detail)/(this.data.orderList.goodsList[event.currentTarget.id].cal_num+1)
    console.log(this.data.orderList.goodsList[event.currentTarget.id].star);
    // this.setData({
    //   value:this.data.value
    // })
  },



  inputs(e) {
    this.data.comments[e.currentTarget.id]=e.detail
    var len = parseInt(this.data.comments[e.currentTarget.id].length);
    console.log(this.data.comments);
    var fontNum = 400;
    if (len > this.data.max) return;
    this.setData({
      fontNum: 400 - len, //当前字数  
      comments:this.data.comments
    });
    if (this.data.fontNum == 0) {
      console.log(fontNum);
      wx.showModal({
        title: '提示',
        content: '您输入的字数已达上限',
      })
    }
  },

  ChooseImage(e) {
    var imgList=this.data.imgList
    wx.chooseMedia({
      count:4,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration:60,
      success: (res) => {
        for (var i = 0; i < res.tempFiles.length; i++) {
          imgList[e.currentTarget.id].push(res.tempFiles[i].tempFilePath)
        }
        this.setData({
          imgList: imgList
        })
        console.log("路径", this.data.imgList)
      }
    });
  },

  //删除图片
  DeleteImg(e) {
    wx.showModal({
      title: '要删除这张照片吗？',
      content: '',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  previewImage(e){
    console.log(e.currentTarget.dataset.url)
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    }) 
  },
   uploadfile(j,cp, fP) {
    var media=this.data.media
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
      cloudPath: 'comments/'+new Date().getTime() + '.' + cp,
      filePath: fP, // 文件路径
      success:  res => {
        console.log("上传至云端的链接为",res.fileID);
        media[j]=this.data.media[j].concat(res.fileID)
        console.log(media);
        this.setData({
          media:media
        })
        if(media[j].length==this.data.imgList[j].length){
        resolve(res)
      }
      },
      fail: err => {
        // handle error
      }
    })
  })
  },
  uploadMedia(j) {
    // wx.showLoading({
    //   title: '发布中...',
    // })
    var extension = null
    console.log(this.data.imgList[j].length)
    for (var i = 0; i < this.data.imgList[j].length; i++) {
      if (this.data.imgList[j][i]) {
        extension = this.data.imgList[j][i].split('.').pop();
      }
      this.upload_othcom1(j,extension, this.data.imgList[j][i])
    }
  },
  upload_othcom(i){
    var that=this
    var date = new Date();
    var strDate = date.getDate().toString();
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    commentslist.add({
        data:{
          star:this.data.value[i],
          media:this.data.media[i],
          goodsid:this.data.orderList.goodsList[i].goodsid,
          comments:this.data.comments[i],
          time:year+'-'+month+'-'+strDate,
          detail:this.data.orderList.goodsList[i].sortTitle+this.data.orderList.goodsList[i].sortDetail
        },
        success(res){
          console.log(res);
          console.log("添加成功");
          goods.where({
            _id:that.data.orderList.goodsList[i].goodsid
          })
          .update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
              star: that.data.orderList.goodsList[i].star,
              cal_num:that.data.orderList.goodsList[i].cal_num+1
            },
            success: function(res) {
              console.log("更新成功",res.data)
              wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 800
              })
            }
          })
        },
        fail(res){
          console.log(res);
          console.log("添加失败");
        }
      })
  },
  upload_othcom1(i,extension,img){
    this.uploadfile(i,extension, img).then(res => {
      var date = new Date();
      var strDate = date.getDate();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
    commentslist.add({
        data:{
          star:this.data.value[i],
          media:this.data.media[i],
          goodsid:this.data.orderList.goodsList[i].goodsid,
          comments:this.data.comments[i],
          time:year+'-'+month+'-'+strDate,
          detail:this.data.orderList.goodsList[i].sortTitle+this.data.orderList.goodsList[i].sortDetail
        },
        success(res){
          console.log(res);
          console.log("添加成功");
          goods.where({
            _id:that.data.orderList.goodsList[i].goodsid
          })
          .update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
              star: that.data.orderList.goodsList[i].star,
              cal_num:that.data.orderList.goodsList[i].cal_num+1
            },
            success: function(res) {
              console.log("更新成功",res.data)
              wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 800
              })
            }
          })
        },
        fail(res){
          console.log(res);
          console.log("添加失败");
        }
      })  
    })
  },
async  pub(){
    for(var i=0;i<this.data.orderList.goodsList.length;i++){
      if(this.data.value[i]){
        var imgList=this.data.imgList[i]
        if(!imgList.length){
          await  this.upload_othcom(i)
        }
        else{
          await  this.uploadMedia(i)

        }
        wx.showToast({
          title: '感谢您的评价',
          icon: 'none',
          duration: 1000
        })
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: '../orders/index',
        //   })
        // }, 1000);
      }
      else{
        wx.showToast({
          title: '请输入整体评价',
          icon: 'none',
          duration: 1000
        })
      }
    }

  },
  getOrderList:function(orderid){
    let that = this;
    orderList.doc(orderid).get({
        success: function(res) {
          console.log("now is ",res.data)
          for(var j=0;j<res.data.goodsList.length;j++){
            that.data.imgList.push([])
            that.data.media.push([])
          }
          that.setData({
            orderList:res.data,
            imgList:that.data.imgList,
            media:that.data.media
          })
          var item;
          let goodsSubTotalPrice=that.data.goodsSubTotalPrice
          let subAllAmount=that.data.subAllAmount
          for(item in that.data.orderList.goodsList){
            goodsSubTotalPrice+=that.data.orderList.goodsList[item].sortPrice*that.data.orderList.goodsList[item].mount;
            subAllAmount+=that.data.orderList.goodsList[item].mount
          }
          that.setData({
            subAllAmount:subAllAmount,
            goodsSubTotalPrice:goodsSubTotalPrice,
          })
          that.cal_star()
        }
      })


    
  },
  cal_star(){
    var that=this
    console.log(this.data.orderList);
    var goodsList=this.data.orderList.goodsList
    var count=0
      goodsList.forEach(item=>{
      goods.where({
        _id:item.goodsid
      })
      .get({
        success:function(res) {
          console.log(item.goodsid);
          count++;
           item.cal_num=res.data[0].cal_num
           item.star=res.data[0].star
           item.avgStar=res.data[0].star
          if(count==goodsList.length){
            that.setData({
              goodsList:goodsList
            })
          }
        }
      })
    })
  },

  // cal_star(){
  //   var that=this
  //   console.log(this.data.orderList);
  //   var goodsList=this.data.orderList.goodsList
  //   var count=0
  //     goodsList.forEach(item=>{
  //     commentslist.where({
  //       goodsid:item.goodsid
  //     })
  //     .get({
  //       success:function(res) {
  //         count++;
  //         console.log("before",item);
  //         console.log(res.data)
  //         console.log("当前评价人数",res.data.length)
  //         var allstar=0
  //         for(var j=0;j<res.data.length;j++){
  //           allstar+=res.data[j].star
  //         }
  //         console.log("当前总分",allstar);
  //         item.cal_num=res.data.length
  //         console.log(item);
  //         if(allstar==0){
  //           item.avgStar=0
  //           item.star=0
  //         }
  //         else{
  //           item.avgStar=allstar/res.data.length
  //           item.star=allstar/res.data.length
  //         }
  //         if(count==goodsList.length){
  //           that.setData({
  //             goodsList:goodsList
  //           })
  //         }
  //       }
  //     })
  //   })
  // },
  // cal_star(){
  //   const $ = wx.cloud.database().command.aggregate
  //   wx.cloud.database().collection('comments')
  //   .aggregate()
  // .group({
  //   // 按 category 字段分组
  //   _id: '$goodsid',
  //   // 让输出的每组记录有一个 avgSales 字段，其值是组内所有记录的 sales 字段的平均值
  //   avgStar: $.avg('$star')
  // })
  // .sort({
  //   avgStar: -1,
  // })
  // .end({
  //   success: function(res) {
  //     console.log(res)
  //   },
  //   fail: function(err) {
  //     console.error(err)
  //   }
  // })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:  function (options) {
    this.setData({
      goods: app.goods,
      orderid:options.id
    })
    this.getOrderList(this.data.orderid)
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