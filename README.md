# 英语闯关

爸爸为你挑的英文动画。给 6–8 岁英语零基础孩子的三关小冒险：字母拼读、英文动画、绘本朗读。每关 9 条视频，看完手动打卡并完成亲子小任务，即可获得徽章、解锁下一关。

直接双击 `index.html` 即可打开（播放需要联网）。也可以在本目录运行 `python3 -m http.server 8000`，浏览器打开 `http://localhost:8000`。无需安装依赖或构建。手机、平板使用可访问的静态 HTTP(S) 地址；Safari 分享 → 添加到主屏幕。没有 service worker，不提供离线播放。

进度仅保存在当前浏览器的 `zenkids-en-*` localStorage 键里；「继续观看」回到上次视频，不记录秒数。若本地文件模式限制存储，请使用静态服务器。播放器需手动点按启动。

## 数据

`verified-videos.json` 是 27 条已核实视频的原始资料。`data.js` 保持单行 `const DATA = {...};`，包含 `site`、`videos`、`channels`、`categories`、`path`、`built`。每关 `items` 仅为 `{id, note}`，亲子任务保留在 `mission`。视频字段保持 BiliPicks 格式，审查字段不进入公开播放清单；未设频道榜。`update.py` 可读取该单行，`python3 update.py --check` 联网检查而不写入（本次未重新联网核验）。不要运行上游脚本的 `--deploy`，它会提交并推送。

审查记录见 [REVIEW_LOG.md](REVIEW_LOG.md)。部分视频为网友搬运，版权归原作者，可能下架；请家长陪同，仅在家中观看，不下载或转传，家庭观看并不代表版权授权。本站不是 B 站官方产品，只嵌入其官方播放器。

## 致谢与许可

改编自 [BiliPicks](https://github.com/limin112/bilipicks)，作者 **limin112 / MinLiBuilds**。

代码沿用 [MIT License](LICENSE)，保留 **Copyright (c) 2026 MinLiBuilds**。视频与封面版权不在 MIT 授权范围内。`LICENSE`、原始核验资料和审查日志均予保留。`tv.html` 为简洁的大屏引导页。
