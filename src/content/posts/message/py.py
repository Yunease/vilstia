import os
import re

# 定义情绪替换规则：key是需要替换的旧值，value是新值
MOOD_REPLACE_RULES = {
    "焦虑": "焦躁",
    "烦躁": "焦躁",
    "难过": "消沉",
    "摆烂": "消沉"
}

# 编译正则表达式：匹配以mood开头，后接冒号+空格+情绪值的行（兼容前后空格）
# 分组1：mood字段的前缀（mood: + 空格），分组2：原情绪值，分组3：行尾内容（如换行/空格）
MOOD_PATTERN = re.compile(r'^(mood:\s*)(%s)(\s*)$' % '|'.join(MOOD_REPLACE_RULES.keys()), re.MULTILINE)

def replace_mood_in_md(file_path):
    """处理单个md文件的mood字段替换"""
    try:
        # 读取文件内容（UTF-8编码，兼容中文）
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 记录是否修改了文件
        modified = False
        
        # 定义替换函数：根据规则替换情绪值
        def replace_match(match):
            nonlocal modified
            prefix = match.group(1)  # 比如 "mood: "
            old_mood = match.group(2) # 原情绪值（如焦虑/烦躁）
            suffix = match.group(3)   # 行尾的空格/换行
            new_mood = MOOD_REPLACE_RULES[old_mood]
            modified = True
            print(f"  ✅ 替换 {old_mood} → {new_mood}")
            return f"{prefix}{new_mood}{suffix}"
        
        # 执行替换
        new_content = MOOD_PATTERN.sub(replace_match, content)
        
        # 仅当内容有修改时才写入文件
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ 处理完成：{file_path}")
        else:
            print(f"ℹ️ 无需修改：{file_path}（无匹配的情绪值）")
            
    except Exception as e:
        print(f"❌ 处理失败：{file_path} → 错误：{str(e)}")

def scan_and_process_md_files():
    """扫描当前文件夹及所有子文件夹的md文件，逐个处理"""
    # 获取当前脚本所在目录（即执行脚本时的当前目录）
    current_dir = os.getcwd()
    print(f"开始扫描目录：{current_dir}")
    print("-" * 50)
    
    # 遍历所有子文件夹，筛选.md文件
    for root, dirs, files in os.walk(current_dir):
        for file in files:
            if file.lower().endswith('.md'):
                file_path = os.path.join(root, file)
                print(f"\n正在处理：{file_path}")
                replace_mood_in_md(file_path)
    
    print("-" * 50)
    print("扫描处理完成！")

if __name__ == "__main__":
    # 运行前提示（可选备份）
    input("⚠️  运行脚本前建议备份md文件！按回车键开始处理...")
    scan_and_process_md_files()