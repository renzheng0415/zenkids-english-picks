# 银银的英语闯关

Yinyin's English Adventure

爸爸给银银做的专属版，银银和小兔子一起冒险。给 6–8 岁英语零基础孩子的八关小冒险：字母、自然拼读、颜色数字、动物、家人身体、日常对话、英文动画、绘本故事。共 76 条视频，每关 9–10 条视频，看完手动打卡并完成亲子小任务，即可获得徽章、解锁下一关。

直接双击 `index.html` 即可打开（播放需要联网）。也可以在本目录运行 `python3 -m http.server 8000`，浏览器打开 `http://localhost:8000`。无需安装依赖或构建。手机、平板使用可访问的静态 HTTP(S) 地址；Safari 分享 → 添加到主屏幕。没有 service worker，不提供离线播放。

进度仅保存在当前浏览器的 `zenkids-en-done-v1`、`zenkids-en-missions-v1`、`zenkids-en-last-v1` localStorage 键里；「继续观看」回到上次视频，不记录秒数。若本地文件模式限制存储，请使用静态服务器。播放器需手动点按启动。

## 数据

`verified-videos.json` 保留旧 27 条核验原始资料；当前八关 76 条播放清单在 `data.js`，扩充与替换记录见审查日志。`data.js` 保持单行 `const DATA = {...};`，包含 `site`、`videos`、`channels`、`categories`、`path`、`built`。每关 `items` 仅为 `{id, note}`，亲子任务保留在 `mission`。旧视频字段保持 BiliPicks 格式，新视频保留核验清单字段；未设频道榜。`update.py` 可读取该单行，`python3 update.py --check` 联网检查而不写入（本次未重新联网核验）。不要运行上游脚本的 `--deploy`，它会提交并推送。

审查记录见 [REVIEW_LOG.md](REVIEW_LOG.md)。部分视频为网友搬运，版权归原作者，可能下架；请家长陪同，仅在家中观看，不下载或转传，家庭观看并不代表版权授权。本站不是 B 站官方产品，只嵌入其官方播放器。

## 致谢与许可

改编自 [BiliPicks](https://github.com/limin112/bilipicks)，作者 **limin112 / MinLiBuilds**。

代码沿用 [MIT License](LICENSE)，保留 **Copyright (c) 2026 MinLiBuilds**。视频与封面版权不在 MIT 授权范围内。`LICENSE`、原始核验资料和审查日志均予保留。`tv.html` 为简洁的大屏引导页。

## 银银的画廊与奖励

「画廊」展示银银画在纸上的彩虹公主。先展示 poster，点击播放才加载 `assets/yinyin/rainbow-princess-web.gif`，可暂停。八关视频与八个小任务全部完成后解锁 **Rainbow Princess / 彩虹公主**，显示可关闭的通关庆祝；徽章页可以重播庆祝，旧视频打卡和同 id 任务进度保留；新增视频与五个新任务完成前不会自动庆祝。

头像、向导、打卡鼓励、庆祝直接使用 `assets/yinyin/` 中的 WebP 插画。八关分别使用 `badge-关卡id.webp` 专属徽章。页面不使用原始大 GIF，不展示真实人物照片或额外个人信息。主屏幕图标使用 `icons/` 中的银银头像，manifest 名称为「银银的英语闯关」。

## 脚本验收

运行 `node tests/progression.test.js`，无需 Chrome 或额外依赖，验证数据、旧进度恢复、逐关解锁、打卡、任务、播放器网址及最终庆祝。
