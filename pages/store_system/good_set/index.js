// pages/store_system/good_set/index.js
const goodslist = wx.cloud.database().collection("goods")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    headline:'',
    imgList: [],
    oneItems: ["橘子", "猕猴桃", "西瓜", "柠檬", "苹果", "梨", "菠萝", "香蕉", "百香果", "其他"],
    twoItems: [],
    checked: false,
    activeNames: ['1'],
    result: ['尺寸', '重量'],
    show: false,
    kind1: "尺寸",
    kind2: "重量",
    Kind1: "尺寸",
    Kind2: "重量",
    check1: true,
    check2: true,
    sizenum: 1,
    sizeList: [{
      detail: '',
      price: '',
      num: ''
    }],
    max: 35,
    media: [],
    shop_id: ''
  },

  tap_check1() {
    this.setData({
      check1: !this.data.check1
    })
  },

  tap_check2() {
    this.setData({
      check2: !this.data.check2
    })
  },

  addsize() {
    var item = {
      detail: '',
      price: '',
      num: ''
    }
    item['sort-title']=''
    this.data.sizeList.push(item)
    this.setData({
      sizenum: this.data.sizenum + 1,
      sizeList: this.data.sizeList
    })
  },

  deletesize(e) {
    console.log(e.currentTarget.dataset.index);
    this.data.sizeList.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      sizenum: this.data.sizenum - 1,
      sizeList: this.data.sizeList
    })
  },


  checkboxChange(e) {
    console.log("checkbox发生change事件，携带value值为：", e.detail.value)
    this.setData({
      result: e.detail.value
    })
  },


  getKind1(e) {
    this.setData({
      kind1: e.detail,
    })
  },

  getKind2(e) {
    this.setData({
      kind2: e.detail
    })
  },

  setkind() {
    if (this.data.result.length == 2) {
      this.data.result[0] = this.data.kind1,
        this.data.result[1] = this.data.kind2,
        this.setData({
          Kind1: this.data.kind1,
          Kind2: this.data.kind2,
          result: this.data.result,
          show: false,
        })
    } else if (this.data.result.length == 1) {
      var kind = [this.data.kind1, this.data.kind2]
      this.data.result[this.data.index] = kind[this.data.index]
      this.data.Kind1 = kind[0]
      this.data.Kind2 = kind[1]
      this.setData({
        Kind1: this.data.kind1,
        Kind2: this.data.kind2,
        result: this.data.result,
        show: false,
      })
    }
  },
  inputs(e) {
    var headline = e.detail.value,
      len = parseInt(headline.length);
    var fontNum = 35;
    if (len > this.data.max) return;
    this.setData({
      fontNum: 35 - len, //当前字数  
      headline: headline
    });
    if (this.data.fontNum == 0) {
      console.log(fontNum);
      wx.showModal({
        title: '提示',
        content: '您输入的字数已达上限',
      })
    }
  },

  showPopup() {
    if (this.data.result.length == 1) {
      if (this.data.result[0] == this.data.Kind1) {
        this.setData({
          index: 0
        })
      } else {
        this.setData({
          index: 1
        })
      }
    }
    this.setData({
      show: true
    });
  },

  onClose() {
    this.setData({
      show: false
    });
  },
  onChange_checked({
    detail
  }) {
    // 需要手动对 checked 状态进行更新
    this.setData({
      checked: detail
    });
  },

  onChange_checkbox(event) {
    this.setData({
      result: event.detail,
    });
  },

  onChangeOnlyPrice(event) {
    // event.detail 为当前输入的值
    this.setData({
      OnlyPrice: event.detail
    })
  },

  onChangeOnlyNum(event) {
    // event.detail 为当前输入的值
    this.setData({
      OnlyNum: event.detail
    })
  },

  onChangeDetail(e) {
    console.log("点击的index为", e.currentTarget.dataset.index);
    console.log("输入数值为", e.detail);
    this.data.sizeList[e.currentTarget.dataset.index].detail = e.detail
    this.setData({
      sizeList: this.data.sizeList
    })
  },

  onChangeSorttitle(e) {
    console.log("点击的index为", e.currentTarget.dataset.index);
    console.log("输入数值为", e.detail);
    this.data.sizeList[e.currentTarget.dataset.index]['sort-title'] = e.detail
    this.setData({
      sizeList: this.data.sizeList
    })
  },

  onChangePrice(e) {
    console.log("点击的index为", e.currentTarget.dataset.index);
    console.log("输入数值为", e.detail);
    this.data.sizeList[e.currentTarget.dataset.index].price = parseInt(e.detail)
    this.setData({
      sizeList: this.data.sizeList
    })
  },

  onChangeNum(e) {
    console.log("点击的index为", e.currentTarget.dataset.index);
    console.log("输入数值为", e.detail);
    this.data.sizeList[e.currentTarget.dataset.index].num = e.detail
    this.setData({
      sizeList: this.data.sizeList
    })
  },

  ChooseImage() {
    wx.chooseMedia({
      count: 4,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        for (var i = 0; i < res.tempFiles.length; i++) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFiles[i].tempFilePath)
          })
        }
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
  previewImage(e) {
    console.log(e.currentTarget.dataset.url)
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  },

  async uploadMedia() {
    // wx.showLoading({
    //   title: '发布中...',
    // })
    var extension = null
    var media = this.data.media

    for (var i = 0; i < this.data.imgList.length; i++) {
       if(this.data.imgList[i].indexOf("cloud") == 0)break
        console.log("11111");
        console.log(this.data.imgList[0].indexOf("cloud"));

      console.log(this.data.imgList[i])
      console.log(this.data.imgList[i].indexOf("cloud"));
      if (this.data.imgList[i]) {
        extension = this.data.imgList[i].split('.').pop();
      }
      await new Promise((resolve, reject) => {
        // this.uploadfile(extension, this.data.imgList[i])
        wx.cloud.uploadFile({
          cloudPath: 'goods/test1/' + this.data.shop_id + '/' + new Date().getTime() + '.' + extension,
          filePath: this.data.imgList[i], // 文件路径
          success: res => {
            media = this.data.media.concat(res.fileID)
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
        if (this.data.media.length == this.data.imgList.length) {
          var whole_num = 0
          for (var i = 0; i < this.data.sizeList.length; i++) {
            whole_num = parseInt(whole_num) + parseInt(this.data.sizeList[i].num)
          }
          this.setData({
            whole_num: whole_num
          })
          this.upload_othcom()
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 800
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 800);
        }
      });
    }
  },

  async uploadMedia_Only() {
    var extension = null
    var media = this.data.media
    for (var i = 0; i < this.data.imgList.length; i++) {
      console.log(this.data.imgList[i].indexOf("cloud"));
       if(this.data.imgList[i].indexOf("cloud") == 0)break
      console.log(this.data.imgList[i])
      if (this.data.imgList[i]) {
        extension = this.data.imgList[i].split('.').pop();
      }
      await new Promise((resolve, reject) => {
        // this.uploadfile(extension, this.data.imgList[i])
        wx.cloud.uploadFile({
          cloudPath: 'goods/test1/' + this.data.shop_id + '/' + new Date().getTime() + '.' + extension,
          filePath: this.data.imgList[i], // 文件路径
          success: res => {
            media = this.data.media.concat(res.fileID)
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
        if (this.data.media.length == this.data.imgList.length) {
          this.upload_othcom_Only()
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 800
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 800);
        }
      });
    }
  },

  upload_othcom() {
    goodslist.add({
      data: {
        headline: this.data.headline,
        largePics: this.data.media,
        num: this.data.whole_num,
        price: parseInt(this.data.sizeList[0].price),
        tag: this.data.selector,
        thumbnail: this.data.media[0],
        sort: this.data.sizeList,
        shop_id: this.data.shop_id,
        click: 0,
        star: 0,
        cal_num: 0,
        goodsStatus:1,
        sold:0
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

  upload_othcom_Only() {
    goodslist.add({
      data: {
        headline: this.data.headline,
        largePics: this.data.media,
        num: parseInt(this.data.OnlyNum),
        price: parseInt(this.data.OnlyPrice),
        tag: this.data.selector,
        thumbnail: this.data.media[0],
        sort: this.data.sortOnly,
        shop_id: this.data.shop_id,
        click: 0,
        star: 0,
        cal_num: 0,
        goodsStatus:1,
        sold:0
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

  selectorChange: function (e) {
    var i = e.detail.value; //获得数组的下标
    var value = this.data.oneItems[i]; //获得选项的值
    this.setData({
      selector: value //将用户选择的值更新赋给selector
    });
  },

  pub() {
    var headline = this.data.headline
    var imgList = this.data.imgList
    var tag = this.data.selector
    var that=this
    // 标题、图片、标签
    if(this.data.change){
      var checked = this.data.checked
      // 不添加规格
      if (!checked) {
        var sortOnly= [{
          detail: '',
          price: parseInt(this.data.OnlyPrice),
          num: parseInt(this.data.OnlyNum),
          shop_id:this.data.shop_id
        }]
        sortOnly["sort-title"]=''
        this.setData({
          sortOnly: sortOnly
        })
        goodslist.doc(this.data.goodsid).update({
          // data 传入需要局部更新的数据
          data: {
            // 表示将 done 字段置为 true
            sort: this.data.sortOnly,
            headline: this.data.headline,
            num: parseInt(this.data.OnlyNum),
            price: parseInt(this.data.OnlyPrice),
            tag: this.data.selector,
          },
          success: function(res) {
            console.log(res)
            wx.showToast({
              title: '更新成功',
              icon: 'success',
              duration: 800
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 800);
          }
        })
      }
      else{
        if (this.data.result.length == 2) {
          if (this.data.sizeList.length) {
            var j=0
            for (var i = 0; i < this.data.sizeList.length; i++) {
              if (!this.data.sizeList[i].detail || !this.data.sizeList[i].num || !this.data.sizeList[i].price || !this.data.sizeList[i]['sort-title']) {
                wx.showToast({
                  title: '输入不能为空',
                  icon: 'none',
                  duration: 2000
                })
              } else {
                j++;
                if(j==that.data.sizeList.length){
                  var whole_num=0
                  for (var i = 0; i < that.data.sizeList.length; i++) {
                    whole_num = parseInt(whole_num) + parseInt(that.data.sizeList[i].num)
                  }
                  that.setData({
                    whole_num: whole_num
                  })
                  goodslist.doc(that.data.goodsid).update({
                    // data 传入需要局部更新的数据
                    data: {
                      // 表示将 done 字段置为 true
                      sort: that.data.sizeList,
                      headline: that.data.headline,
                      tag: that.data.selector,
                      num: that.data.whole_num,
                      price: parseInt(that.data.sizeList[0].price),
                    },
                    success: function(res) {
                      console.log(res)
                      wx.showToast({
                        title: '发布成功',
                        icon: 'success',
                        duration: 800
                      })
                      setTimeout(() => {
                        wx.navigateBack({
                          delta: 1,
                        })
                      }, 800);
                    }
                  })
                }
              }
            }
          } else {
            wx.showToast({
              title: '请添加至少一种规格',
              icon: 'none',
              duration: 2000
            })
          }
        }
        // 未输入属性
        else if (this.data.result.length == 0) {
          wx.showToast({
            title: '至少选择一个水果属性',
            icon: 'none',
            duration: 2000
          })
        }
        // 输入一种属性
        else if (this.data.result.length == 1) {
          if (this.data.sizeList.length) {
            for (var i = 0; i < this.data.sizeList.length; i++) {
              this.data.sizeList[i]['sort-title'] = ''
            }
            this.setData({
              sizeList: this.data.sizeList
            })
            for (var i = 0; i < that.data.sizeList.length; i++) {
              whole_num = parseInt(whole_num) + parseInt(that.data.sizeList[i].num)
            }
            that.setData({
              whole_num: whole_num
            })
            goodslist.doc(that.data.goodsid).update({
              // data 传入需要局部更新的数据
              data: {
                // 表示将 done 字段置为 true
                sort: that.data.sizeList,
                headline: that.data.headline,
                tag: that.data.selector,
                num: that.data.whole_num,
                price: parseInt(that.data.sizeList[0].price),
              },
              success: function(res) {
                console.log(res)
                wx.showToast({
                  title: '发布成功',
                  icon: 'success',
                  duration: 800
                })
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1,
                  })
                }, 800);
              }
            })
          } else {
            wx.showToast({
              title: '请添加至少一种规格',
              icon: 'none',
              duration: 2000
            })
          }
        }
      }

    }
    else{
      if (headline && tag && imgList[0]) {
        var checked = this.data.checked
        // 不添加规格
        if (!checked) {
          if (this.data.OnlyPrice && this.data.OnlyNum) {
            var sortOnly= [{
              detail: '',
              price: parseInt(this.data.OnlyPrice),
              num: parseInt(this.data.OnlyNum),
              shop_id:this.data.shop_id
            }]
            sortOnly["sort-title"]=''
            this.setData({
              sortOnly: sortOnly
            })
            this.uploadMedia_Only()
          } else {
            wx.showToast({
              title: '输入不能为空',
              icon: 'none',
              duration: 2000
            })
          }
        }
        // 添加规格
        else {
          // 有两种属性
          if (this.data.result.length == 2) {
            if (this.data.sizeList.length) {
              var j=0
              for (var i = 0; i < this.data.sizeList.length; i++) {
                if (!this.data.sizeList[i].detail || !this.data.sizeList[i].num || !this.data.sizeList[i].price || !this.data.sizeList[i]['sort-title']) {
                  wx.showToast({
                    title: '输入不能为空',
                    icon: 'none',
                    duration: 2000
                  })
                } else {
                  j++;
                  if(j==this.data.sizeList.length){
                    this.uploadMedia()
                  }
                }
              }
            } else {
              wx.showToast({
                title: '请添加至少一种规格',
                icon: 'none',
                duration: 2000
              })
            }
          }
          // 未输入属性
          else if (this.data.result.length == 0) {
            wx.showToast({
              title: '至少选择一个水果属性',
              icon: 'none',
              duration: 2000
            })
          }
          // 输入一种属性
          else if (this.data.result.length == 1) {
            if (this.data.sizeList.length) {
              for (var i = 0; i < this.data.sizeList.length; i++) {
                this.data.sizeList[i]['sort-title'] = ''
              }
              this.setData({
                sizeList: this.data.sizeList
              })
              this.uploadMedia()
            } else {
              wx.showToast({
                title: '请添加至少一种规格',
                icon: 'none',
                duration: 2000
              })
            }
          }
        }
      } else {
        wx.showToast({
          title: '请输入商品名称、图片和标签',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this
    console.log(options.shop_id);
    this.setData({
      shop_id: options.shop_id
    })
    if(options.goodsid){
      goodslist.doc(options.goodsid)
      .get({
        success(res){
          console.log(res.data);
          console.log();
          if(res.data.sort.length==1&&!res.data.sort[0].detail&&!res.data.sort[0]['sort-title'])
          that.setData({
            headline:res.data.headline,
            imgList:res.data.largePics,
            media:res.data.largePics,
            selector:res.data.tag,
            OnlyPrice:res.data.sort[0].price,
            OnlyNum:res.data.sort[0].num,
            checked:false,
            goodsid: options.goodsid,
            change:1
          })
          else if(!res.data.sort[0].detail||!res.data.sort[0]['sort-title']){
            that.data.sizeList[0].detail=res.data.sort[0].detail==''?res.data.sort[0]['sort-title']:res.data.sort[0].detail,
            that.data.sizeList[0].num=res.data.sort[0].num,
            that.data.sizeList[0].price=res.data.sort[0].price
            for(var j=1;j<res.data.sort.length;j++){
              var item={
                num:res.data.sort[j].num,
                price:res.data.sort[j].price
              }
              item[detail]=res.data.sort[j].detail==''?res.data.sort[j]['sort-title']:res.data.sort[j].detail
              that.data.sizeList=that.data.sizeList.concat(item)
            }
            that.setData({
              headline:res.data.headline,
              imgList:res.data.largePics,
              media:res.data.largePics,
              selector:res.data.tag,
              check1:true,
              check2:false,
              sizeList:that.data.sizeList,
              checked:true,
              sizenum:that.data.sizeList.length,
              goodsid: options.goodsid,
              change:1
            })
          }
          else{
            console.log(res.data.sort[0]['sort-title']);
            that.data.sizeList[0].detail=res.data.sort[0].detail,
            that.data.sizeList[0]['sort-title']=res.data.sort[0]['sort-title'],
            that.data.sizeList[0].num=res.data.sort[0].num,
            that.data.sizeList[0].price=res.data.sort[0].price
            for(var j=1;j<res.data.sort.length;j++){
              var item={
                detail:res.data.sort[j].detail,
                num:res.data.sort[j].num,
                price:res.data.sort[j].price
              }
              item['sort-title']=res.data.sort[j]['sort-title']
              that.data.sizeList=that.data.sizeList.concat(item)
            }
            that.setData({
              headline:res.data.headline,
              imgList:res.data.largePics,
              media:res.data.largePics,
              selector:res.data.tag,
              check1:true,
              check2:true,
              sizeList:that.data.sizeList,
              checked:true,
              sizenum:that.data.sizeList.length,
              goodsid: options.goodsid,
              change:1
            })
          }
        }
      })
    }

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