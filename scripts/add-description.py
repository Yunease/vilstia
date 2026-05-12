"""
自动为 md 文件添加 description 字段。
从正文中提取前 100 个字符作为描述，写入 frontmatter。
"""

import os
import re

# 要处理的目录（脚本所在目录）
POSTS_DIR = os.path.dirname(os.path.abspath(__file__))


def strip_yaml_special(text: str) -> str:
    """删除 YAML 中有特殊含义的字符。"""
    # 删除会破坏 YAML 双引号字符串的字符
    text = text.replace('"', "")   # 双引号
    text = text.replace("\\", "")  # 反斜杠
    text = text.replace("'", "")   # 单引号
    # 删除 YAML 结构性字符
    text = text.replace(":", "")   # 键值分隔
    text = text.replace("#", "")   # 注释
    text = text.replace("{", "")   # 流映射
    text = text.replace("}", "")
    text = text.replace("[", "")   # 流序列
    text = text.replace("]", "")
    text = text.replace("&", "")   # 锚点
    text = text.replace("*", "")   # 别名
    text = text.replace("!", "")   # 标签
    text = text.replace("|", "")   # 块标量
    text = text.replace(">", "")   # 块标量
    text = text.replace("%", "")   # 指令
    text = text.replace("@", "")   # 保留
    text = text.replace("`", "")   # 反引号
    return text


def strip_markdown(text: str) -> str:
    """去除 markdown 语法，保留纯文本。"""
    # 去掉图片 ![alt](url)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # 去掉链接但保留文字 [text](url)
    text = re.sub(r"\[([^\]]*)\]\(.*?\)", r"\1", text)
    # 去掉标题标记 #
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # 去掉加粗/斜体标记
    text = re.sub(r"\*{1,3}(.+?)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}(.+?)_{1,3}", r"\1", text)
    # 去掉行内代码
    text = re.sub(r"`(.+?)`", r"\1", text)
    # 去掉删除线
    text = re.sub(r"~~(.+?)~~", r"\1", text)
    # 去掉 HTML 标签
    text = re.sub(r"<[^>]+>", "", text)
    # 去掉引用标记
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # 去掉列表标记
    text = re.sub(r"^[\s]*[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^[\s]*\d+\.\s+", "", text, flags=re.MULTILINE)
    # 去掉水平线
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    return text


def extract_body(content: str) -> str:
    """从 md 文件内容中提取正文（frontmatter 之后的部分）。"""
    # 匹配 frontmatter：以 --- 开头和结尾
    match = re.match(r"^---\s*\n.*?\n---\s*\n?", content, re.DOTALL)
    if not match:
        return ""
    body = content[match.end():]
    # 去掉开头的空行
    body = body.lstrip("\n")
    return body


def extract_description(body: str, length: int = 100) -> str:
    """从正文中提取指定长度的纯文本作为描述。"""
    clean = strip_markdown(body)
    clean = strip_yaml_special(clean)
    # 去掉多余空白，合并为单行
    clean = re.sub(r"\s+", " ", clean).strip()
    if len(clean) > length:
        clean = clean[:length] + "..."
    return clean


def process_file(filepath: str) -> bool:
    """处理单个 md 文件。返回 True 表示有修改。"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 检查是否已有 description 字段
    frontmatter_match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not frontmatter_match:
        print(f"  跳过（无 frontmatter）: {filepath}")
        return False

    frontmatter = frontmatter_match.group(1)
    if "description:" in frontmatter:
        print(f"  跳过（已有 description）: {filepath}")
        return False

    # 提取正文并生成描述
    body = extract_body(content)
    if not body.strip():
        print(f"  跳过（正文为空）: {filepath}")
        return False

    description = extract_description(body)
    if not description:
        print(f"  跳过（无法提取描述）: {filepath}")
        return False

    # 在 frontmatter 的最后一个 --- 之前插入 description
    insert_pos = frontmatter_match.end()
    # 找到第二个 --- 的位置（frontmatter 结束标记）
    second_delim = content.find("---", content.find("---") + 3)
    # 在第二个 --- 前插入 description
    new_content = (
        content[:second_delim]
        + f'description: "{description}"\n'
        + content[second_delim:]
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"  已处理: {os.path.basename(filepath)}")
    print(f"    描述: {description}")
    return True


def main():
    if not os.path.isdir(POSTS_DIR):
        print(f"目录不存在: {POSTS_DIR}")
        return

    total = 0
    processed = 0

    for root, dirs, files in os.walk(POSTS_DIR):
        for filename in files:
            if not filename.endswith(".md"):
                continue
            filepath = os.path.join(root, filename)
            total += 1
            if process_file(filepath):
                processed += 1

    print(f"\n完成！共扫描 {total} 个文件，处理了 {processed} 个。")


if __name__ == "__main__":
    main()
