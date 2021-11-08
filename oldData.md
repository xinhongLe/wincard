## 页类型
![img.png](img.png)


## 素材页数据结构
```javascript

## 获取素材页

const api= '/Api/WCP/Window/GetPageElements'
const data = {
    "originType": 0,
    "pageID": "39FFCE523A2C23C3B2B90D96D6AF7410" // 页id
}

const result = {
    "success": true,
    "resultCode": 200,
    "resultDesc": "调用成功",
    "result": {
        "Json": "{\"Elements\":[\"{\\\"Name\\\":\\\"圆\\\",\\\"Background\\\":\\\"#B22E8B57\\\",\\\"LineWidth\\\":10.0,\\\"LineType\\\":1,\\\"LineBrush\\\":\\\"#7FFF0000\\\",\\\"UUID\\\":\\\"4c8ef7de-61af-4aab-918a-1918a8524346\\\",\\\"Left\\\":160.7,\\\"Top\\\":177.56,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":1,\\\"IsVisibility\\\":true,\\\"Type\\\":3}\",\"{\\\"Name\\\":\\\"音频1\\\",\\\"OssFileName\\\":\\\"62918F4A69937BF0ECB0815084D54CF0.mp3\\\",\\\"OssImageFileName\\\":null,\\\"OssPlayingImageName\\\":null,\\\"UUID\\\":\\\"7d553c70f85742b7919c772adaaa4782\\\",\\\"Left\\\":299.1,\\\"Top\\\":78.3,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":6}\",\"{\\\"Name\\\":\\\"图片1\\\",\\\"OssFileName\\\":\\\"3B841FB28DF4FED9046BE718330B6288.png\\\",\\\"ImageStretch\\\":0,\\\"UUID\\\":\\\"1f78290c431642318109ece7e89a1a59\\\",\\\"Left\\\":311.9,\\\"Top\\\":251.54,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":5}\",\"{\\\"Name\\\":\\\"矩形1\\\",\\\"Background\\\":\\\"#FFFFFF00\\\",\\\"LineWidth\\\":6.0,\\\"LineType\\\":2,\\\"LineBrush\\\":\\\"#FF9932CC\\\",\\\"CornerRadius\\\":40.0,\\\"UUID\\\":\\\"8a55c0db898840daaf0cab46918ce14e\\\",\\\"Left\\\":114.3,\\\"Top\\\":358.74,\\\"Width\\\":190.0,\\\"Height\\\":92.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":2}\",\"{\\\"Name\\\":\\\"富文本1\\\",\\\"ContentType\\\":\\\"Rich Text Format\\\",\\\"Content\\\":\\\"{\\\\\\\\rtf1\\\\\\\\ansi\\\\\\\\ansicpg1252\\\\\\\\uc1\\\\\\\\htmautsp\\\\\\\\deff2{\\\\\\\\fonttbl{\\\\\\\\f0\\\\\\\\fcharset0 Times New Roman;}{\\\\\\\\f2\\\\\\\\fcharset0 Microsoft YaHei UI;}}{\\\\\\\\colortbl\\\\\\\\red0\\\\\\\\green0\\\\\\\\blue0;\\\\\\\\red255\\\\\\\\green255\\\\\\\\blue255;}\\\\\\\\loch\\\\\\\\hich\\\\\\\\dbch\\\\\\\\pard\\\\\\\\plain\\\\\\\\ltrpar\\\\\\\\itap0{\\\\\\\\lang1033\\\\\\\\fs18\\\\\\\\f2\\\\\\\\cf0 \\\\\\\\cf0\\\\\\\\ql{\\\\\\\\f2 {\\\\\\\\ltrch \\\\\\\\u23500?\\\\\\\\u25991?\\\\\\\\u26412?1}{\\\\\\\\lang2052\\\\\\\\ltrch \\\\\\\\u27979?\\\\\\\\u-29739?}\\\\\\\\li0\\\\\\\\ri0\\\\\\\\sa0\\\\\\\\sb0\\\\\\\\fi0\\\\\\\\ql\\\\\\\\par}\\\\r\\\\n}\\\\r\\\\n}\\\",\\\"UUID\\\":\\\"37ebb95ac7c849abbc4c86f8daef7af7\\\",\\\"Left\\\":382.3,\\\"Top\\\":356.78,\\\"Width\\\":200.0,\\\"Height\\\":50.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":11}\",\"{\\\"Name\\\":\\\"线段1\\\",\\\"LineWidth\\\":10.0,\\\"LineType\\\":1,\\\"LineBrush\\\":\\\"#FFFF4500\\\",\\\"UUID\\\":\\\"d0e1fe6dc36340c2814b29c3216850be\\\",\\\"Left\\\":339.4,\\\"Top\\\":498.64,\\\"Width\\\":154.4,\\\"Height\\\":62.8,\\\"Angle\\\":10.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":4}\",\"{\\\"Name\\\":\\\"文本框1\\\",\\\"Text\\\":\\\"文本框1\\\",\\\"Background\\\":\\\"#00FFFFFF\\\",\\\"FontFamily\\\":\\\"Microsoft YaHei\\\",\\\"IsFontBold\\\":true,\\\"FontSize\\\":40,\\\"Foreground\\\":\\\"#FF000000\\\",\\\"HorizontalAlignment\\\":1,\\\"VerticalAlignment\\\":1,\\\"LineWidth\\\":4.0,\\\"LineHeight\\\":30.0,\\\"LineType\\\":0,\\\"LineBrush\\\":\\\"#FF008B8B\\\",\\\"CornerRadius\\\":0.0,\\\"UUID\\\":\\\"7285899952744f708143aeedb4c4bf82\\\",\\\"Left\\\":434.3,\\\"Top\\\":131.98,\\\"Width\\\":191.2,\\\"Height\\\":101.2,\\\"Angle\\\":-16.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":1}\",\"{\\\"Name\\\":\\\"嵌入视频1\\\",\\\"IsPlay\\\":true,\\\"OssFileName\\\":\\\"AFC39F0D00019B81A7FF62D3148E5CCB.mp4\\\",\\\"OssDefaultImage\\\":\\\"BF72D327A0E4464C4720D600599BEA97.png\\\",\\\"AutoGetFirstImage\\\":true,\\\"UUID\\\":\\\"9fa0ffb96aab499d9a0260243d9ff6fe\\\",\\\"Left\\\":61.0,\\\"Top\\\":474.93,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":8}\",\"{\\\"Name\\\":\\\"弹窗视频1\\\",\\\"IsPlay\\\":false,\\\"OssFileName\\\":\\\"435F9C581336C2582C98A7708699585D.mp4\\\",\\\"OssImageFileName\\\":null,\\\"UUID\\\":\\\"2b5f63d7d5e74bdbbb5d554c0b34ef0b\\\",\\\"Left\\\":479.1,\\\"Top\\\":414.46,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":7}\",\"{\\\"Name\\\":\\\"引用视频1\\\",\\\"OssImageFileName\\\":null,\\\"OssDefaultImage\\\":null,\\\"AutoGetFirstImage\\\":false,\\\"FileID\\\":\\\"39FDFD2BF9EA225CA7EBD62EBEB48FA2\\\",\\\"FileDetail\\\":\\\"英语 苏教版 一上 Unit1 \\\\r\\\\n 查看视频转圈圈.mp4\\\",\\\"IsPlay\\\":false,\\\"IsEject\\\":false,\\\"UUID\\\":\\\"0d05bf650fa44eee87b6a1fadcad7baa\\\",\\\"Left\\\":238.07,\\\"Top\\\":523.73,\\\"Width\\\":100.0,\\\"Height\\\":100.0,\\\"Angle\\\":0.0,\\\"ZIndex\\\":0,\\\"IsVisibility\\\":true,\\\"Type\\\":10}\"],\"Events\":[],\"Steps\":[],\"PageSetting\":\"{\\\"BackColor\\\":\\\"#FFF6FFFB\\\",\\\"OssFileName\\\":\\\"\\\",\\\"Width\\\":1280.0,\\\"Height\\\":720.0}\"}"
    }
}

const Json = {
    Elements: [], // 所有的原件
    Events: [], // 触发器
    PageSetting: {}, // 页面设置
    Steps: [], // 步骤
}

const Elements =[
    {
        Type: 1,  // 文本1  矩形2  圆3  线段4  图片5  音频6
        // 弹框视频（小视频）7  嵌入视频（大视频）8  flash 9 引用视频10 富文本11  互动教具12
        Left: 770,   //左间距
        Top: 464.72,  //上间距
        Height: 91.64,  //高度
        Width: 262.47,  //宽度
        ZIndex: 0,   //层级
        Angle: 0,  //旋转角度
        IsVisibility: true,   //是否显示
        Name: 文本框,   //控件名称
        Background: "#FFFF4500",   //背景色
        FontFamily: "Microsoft YaHei UI",  //字体类型
        IsFontBold: false,  //字体加粗
        FontSize: 36, //字体大小
        LineHeight: 22,  //行高
        Foreground: "#FF2E8B57",   //字体颜色
        HorizontalAlignment: 1,   //水平对齐 0 left  1 center  2 right  
        VerticalAlignment: 1,   //垂直对齐 0 left  1 center  2 right 
        LineWidth: 4,   //边框宽度
        LineBrush: "#FF0C0C0C",   //边框颜色
        CornerRadius: 1,   //圆角半径
        LineType: 0,  //边框类型  1实线 0虚线  
        Name: "文本框1",  //原件名称
        Text: "测试文本框", // 文本内容
        UUID: "345a9435ae2b4285bf8dba4c5a14f427",
        AutoGetFirstImage: true, // 自动播放
        ImageStretch: 0 , // 图片显示模式 0 缩放  1拉伸
        OssFileName: "47D8AE1F0A61EDBD6589CA.png", // 音频、视频地址
        OssImageFileName: null,  // 音频图片地址
        OssPlayingImageName: null, // 音频播放中图片地址
        OssDefaultImage: "9BBADA3C8EA78ADF0D9FAEC3.png", // 视频封面地址
        AutoGetFirstImage: true, // 是否自动获取封面
    }
]

const Event = [ // 触发器
    {
        SourceID:"4c8ef7de-61af-4aab-918a-1918a8524346",
        EventType:1,
        Actions:[{TargetID:"4c8ef7de-61af-4aab-918a-1918a8524346",ActionType:3}],
        CustomActions:[
          {
            CustomActionType:1,
            ActionData: 
              {
                  WindowID:"39FEDC4503DCFCCEDC1F7EE918538B28",
                  WindowName:"测试",
                  Cards:[{
                        CardID:"39FEDD5A25BE4B6ED87AC2DA8452CD24",
                        CardName:"123123",
                        Pages:[{ CardID: "39FEF68A2743DC8E97CF9AC11C604D37", CardName:"跟读页",Type:13}]}]
              }
          } // json格式
        ]
    }
]

const PageSetting = {  //页面设置
    BackColor:"#FFF6FFFB",
    OssFileName:'',
    Width:1280.0,
    Height:720.0
},

const Steps = [ // 步骤
    {
        Actions: [
            {
                ActionType: 3,
                TargetID: "8a55c0db898840daaf0cab46918ce14e"
            },
            {
                ActionType: 3,
                TargetID: "7285899952744f708143aeedb4c4bf82"
            }
        ],
        Step: 1
    }
]


## 更新素材页

const api = '/Api/WCP/Window/SavePageElements'

const data = {
    json: "string", // json格式
    pageID: "string", // 页id
    originType: 0
}
```



## 跟读页数据结构

```javascript

// 获取视频也内容
const api = '/Api/WCP/Window/GetPageVideo'
const data = {
    "originType": 0,
    "pageID": "39FEF68A2743DC8E97CF9AC11C604D37"
}


const result = {
    "success": true,
    "resultCode": 200,
    "resultDesc": "调用成功",
    "result": {
        "VideoFile": {
            "SN": 0,
            "FileName": "AE0A3BAC44580F78D5D9BD421A2952D3",
            "Bucket": "axsfile",
            "FilePath": "ElementFile",
            "Extention": "mp4",
            "FileMD5": "AE0A3BAC44580F78D5D9BD421A2952D3",
            "Type": 5,
            "Name": "5A2.1【易加】三角形面积的计算  _x264(1)",
            "ID": "39FF2399D369AD930C648B7C0BB6AB29"
        },
        "ElementSource": {
            "Subject": {
                "Name": "数学",
                "ID": "39F766472E16F43AE0EAE334481AF7BA"
            },
            "Publisher": {
                "Name": "苏教版",
                "ID": "39F7666AAF66E4DC95726D72374B09E6"
            },
            "Album": {
                "Name": "四上",
                "ID": "39F7666AAF94E8C66B7BDDD2EA351D4A"
            },
            "Chapter": {
                "Name": "1单元",
                "ID": "39F7666AAFDA4B8C354CCB2BD949EBB0"
            },
            "Lesson": {}
        },
        "Pauses": [], // 视频进度
    }
}

// 更新视频页内容
const api = '/Api/WCP/Window/SavePageVideo'

const data = {
    "originType": 0,
    "pageID": "string",
    "videoID": "string" // 就是result.VideoFile.ID
}

```



## 听写页数据结构

```javascript
// 获取听写页内容
const api = '/Api/WCP/Listen/GetPageWords'

const data = {
    pageID: "39FEBC37B27EA895E9AE13F33CE09569",
    originType: 0
}


const result = {
    "success": true,
    "resultCode": 200,
    "resultDesc": "调用成功",
    "result": [
        {
            "PageWordID": "39FFD2F644F1CAB6EBC3038AC0CDA338",
            "WordID": "39FED7308B47FE07436EC33844DE78F5",
            "File": {
                "SN": 0,
                "FileName": "EFF4D19486842BDF411839B61AE22B71",
                "Bucket": "axsfile",
                "FilePath": "TeachPageFile",
                "Extention": "mp3",
                "FileMD5": "EFF4D19486842BDF411839B61AE22B71",
                "Type": 4,
                "Name": "5.系统已为您批阅好作业，快去一键审阅吧",
                "ID": "39FED7308B47AC31479A0A98A3B13FD8"
            },
            "Name": "苹果", // 字词名称
            "WordInterval": 2, // 听写间隔
        },
      ]
}


// 更新字词也内容

const api = '/Api/WCP/Listen/PageSaveWord'

const data = {
    "pageID": "string", // 页id
    "originType": 0,
    "words": [
        {
            "wordID": "string",
            "pageWordID": "string", // 如果是新增字词则传null
            "wordInterval": 0, // 听写间隔
            "sort": 0, // 字词的排序
        }
    ],
}
```

