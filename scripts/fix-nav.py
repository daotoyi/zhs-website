files = ['about.html', 'classics.html', 'practice.html', 'shop.html', 'pandao.html', 'origin.html', 'index.html']

for f in files:
    path = f'/Users/wenhua/Library/CloudStorage/OneDrive-个人/zhenhesheng/zhs-website/zhenhesheng.cn/{f}'
    with open(path, 'r') as fp:
        content = fp.read()
    
    # Old: 四柱八字 links to classics.html#bazi
    old_nav = '<li><a href="classics.html#bazi">四柱八字</a></li>'
    new_nav = '<li><a href="practice.html#bazi">八字命理入门</a></li>'
    
    if old_nav in content:
        content = content.replace(old_nav, new_nav)
        print(f'✅ {f}')
    else:
        # Check if already updated
        if '八字命理入门' in content:
            print(f'⚠️  {f} - already done')
        else:
            print(f'?   {f} - different format')
    
    with open(path, 'w') as fp:
        fp.write(content)

print('\nDone!')
