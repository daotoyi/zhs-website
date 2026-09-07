# -*- coding: utf-8 -*-
"""为 7 个页面页脚添加公安备案 + ICP 备案号更新为 -2"""
import os

BASE = '/Users/wenhua/Library/CloudStorage/OneDrive-个人/zhenhesheng/zhs-website/zhenhesheng.cn'
FILES = ['index.html', 'origin.html', 'classics.html', 'practice.html', 'shop.html', 'pandao.html', 'about.html']

# 旧 footer-bottom 行 (含 ICP 链接)
OLD = '© 2026 真和盛 · 道家文化传承平台 &nbsp;|&nbsp; <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号</a>'

# 新 footer-bottom 两行:
NEW = ('© 2026 真和盛 · 道家文化传承平台 &nbsp;|&nbsp; '
       '<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">京ICP备2026047935号-2</a><br>'
       '<span class="beian-police"><a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011202102292" '
       'target="_blank" rel="nofollow"><img src="images/beian.png" alt="公安备案" class="beian-icon">'
       '京公网安备11011202102292号</a></span>')

for f in FILES:
    path = os.path.join(BASE, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'✅ {f} - updated')
    else:
        # 检查是否已更新过
        if '京公网安备11011202102292' in content:
            print(f'ℹ️  {f} - already updated')
        else:
            print(f'❌ {f} - NOT FOUND old string!')
