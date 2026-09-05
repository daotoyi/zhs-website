import os

files = ['about.html', 'classics.html', 'practice.html', 'shop.html', 'pandao.html', 'origin.html', 'index.html']

for f in files:
    path = os.path.join('/Users/wenhua/Library/CloudStorage/OneDrive-个人/zhenhesheng/zhs-website/zhenhesheng.cn', f)
    with open(path, 'r') as fp:
        content = fp.read()
    
    # Old footer section (exact match from our previous edits)
    old = '''            <li><a href="about.html">公众号：真和盛</a></li>
            <li><a href="about.html">微信号：zhenhesheng_com</a></li>
            <li><a href="about.html">俱乐部：club.zhenhesheng.cn</a></li>'''
    
    new = '''            <li><a href="about.html">公众号：真和盛（zhenhesheng_com）</a></li>
            <li><a href="about.html">服务号：真和盛文化传承（zhs_service）</a></li>'''
    
    if old in content:
        content = content.replace(old, new)
        print(f"✅ {f} - replaced")
    else:
        print(f"⚠️  {f} - already modified or different format")
        # Show what's actually there around "关注我们" for debugging
        idx = content.find('关注我们')
        if idx >= 0:
            snippet = content[idx:idx+200]
            print(f"   Found at {idx}, snippet: {repr(snippet[:150])}")
    
    with open(path, 'w') as fp:
        fp.write(content)

print("\nDone!")
