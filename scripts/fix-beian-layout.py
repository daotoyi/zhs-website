# -*- coding: utf-8 -*-
"""备案号放最下一行并列显示: 版权行 | 备案行(ICP-2 + 公安)"""
import os

BASE = '/Users/wenhua/Library/CloudStorage/OneDrive-个人/zhenhesheng/zhs-website/zhenhesheng.cn'
FILES = ['index.html', 'origin.html', 'classics.html', 'practice.html', 'shop.html', 'pandao.html', 'about.html']

OLD = ('© 2026 真和盛 · 道家文化传承平台 &nbsp;|&nbsp; '
       '<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号-2</a><br>'
       '<span class="beian-police"><a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011202102292" '
       'target="_blank" rel="noreferrer"><img src="images/beian.png" alt="公安备案" class="beian-icon">'
       '京公网安备11011202102292号</a></span>')

NEW = ('© 2026 真和盛 · 道家文化传承平台<br>'
       '<span class="beian-row">'
       '<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号-2</a>'
       '<span class="beian-sep">&nbsp;|&nbsp;</span>'
       '<a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011202102292" '
       'target="_blank" rel="noreferrer"><img src="images/beian.png" alt="公安备案" class="beian-icon">'
       '京公网安备11011202102292号</a>'
       '</span>')

for f in FILES:
    path = os.path.join(BASE, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'✅ {f} - updated')
    elif 'beian-row' in content:
        print(f'ℹ️  {f} - already updated')
    else:
        print(f'❌ {f} - NOT FOUND!')
