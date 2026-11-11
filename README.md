# 江苏省科学家精神戏剧展示 · 静态网站

展示江苏高校原创“科学家精神”题材剧目的静态站点。纯 HTML / CSS / 原生 JavaScript，无构建步骤，可直接部署于 GitHub Pages。

## 在线访问

部署后地址形如：`https://<用户名>.github.io/<仓库名>/`

## 页面

| 页面 | 文件 | 内容 |
| --- | --- | --- |
| 剧目库（首页） | `index.html` | 首屏 + 剧目卡片（剧名、主题、200 字内简介、剧照占位图），关键词搜索 + 题材筛选，点卡片弹出剧目详情档案 |
| 活动动态 | `news.html` | 新闻按时间倒序（日期、标题、1–2 句摘要），每条支持观众评论（localStorage 本地保存） |
| 关于 | `about.html` | 平台说明、首期参与高校、内容更新说明 |

## 目录结构

```
site/
├── index.html / news.html / about.html   # 三个独立页面
├── assets/
│   ├── css/style.css       # 样式（墨青 · 青瓷绿 · 米白 · 陶土）
│   ├── js/data.js          # 剧目 / 动态数据（在此增补内容）
│   ├── js/main.js          # 公共：工具函数 / 滚动显现
│   ├── js/archive.js       # 剧目库页：搜索、筛选、详情弹窗
│   ├── js/news.js          # 动态页：倒序列表、评论
│   └── stills/*.svg        # 剧照占位图（聚光灯风格，脚本生成）
└── tools/gen_stills.py     # 占位图生成脚本
```

## 新增剧目 / 动态

编辑 `assets/js/data.js`：向 `PLAYS` 追加一条（剧名、学校、主题、简介等字段），或向 `NEWS` 追加一条（列表自动按日期倒序）。剧照占位图可运行 `python tools/gen_stills.py` 生成新的序号版本。

## 本地预览

```
python -m http.server 8765
# 打开 http://127.0.0.1:8765/index.html
```

## 数据来源

剧目资料整理自各高校官网、官方公众号及公开报道（原始整理表：`戏剧展示详细信息.xlsx`），仅供学习交流。
