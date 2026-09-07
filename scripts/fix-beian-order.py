# -*- coding: utf-8 -*-
"""备案行调整: 公安备案(带图标)放前, ICP放后, 同行并列"""
import os

BASE = '/Users/wenhua/Library/CloudStorage/OneDrive-个人/zhenhesheng/zhs-website/zhenhesheng.cn'
FILES = ['index.html', 'origin.html', 'classics.html', 'practice.html', 'shop.html', 'pandao.html', 'about.html']

# 当前: ICP 在前
OLD_BEIAN_ROW = (
    '<span class="beian-row">'
    '<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号-2</a>'
    '<span class="beian-sep">&nbsp;|&nbsp;</span>'
    '<a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011202102292" '
    'target="_blank" rel="noreferrer"><img src="images/beian.png" alt="公安备案" class="beian-icon">'
    '京公网安备11011202102292号</a>'
    '</span>'
)

# 目标: 公安(带图标) 在前, ICP 在后
NEW_BEIAN_ROW = (
    '<span class="beian-row">'
    '<a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011202102292" '
    'target="_blank" rel="noreferrer"><img src="images/beian.png" alt="公安备案" class="beian-icon">'
    '京公网安备11011202102292号</a>'
    '<span class="beian-sep">&nbsp;|&nbsp;</span>'
    '<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号-2</a>'
    '</span>'
)

for f in FILES:
    path = os.path.join(BASE, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if OLD_BEIAN_ROW in content:
        content = content.replace(OLD_BEIAN_ROW, NEW_BEIAN_ROW)
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'✅ {f} - updated (公安在前)')
    elif 'beian-row' in content and '京公网安备11011202102292号</a><span class="beian-sep">' in content:
        print(f'ℹ️  {f} - already 公安在前')
    else:
        print(f'❌ {f} - pattern not found!')
