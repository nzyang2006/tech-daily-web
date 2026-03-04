#!/usr/bin/env node

/**
 * 技术文案搜集脚本
 * 
 * 功能：
 * 1. 使用 Tavily API 搜索 OpenClaw 和 Claude Code 最新技术内容
 * 2. 整理成结构化 JSON 格式
 * 3. 更新到 content 目录
 * 
 * 使用方式：
 * node scripts/fetch-content.js [openclaw|claude-code|all]
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    contentDir: path.join(__dirname, '..', 'content'),
    maxPosts: 10, // 每个主题最多保留的文章数
};

// 搜索查询模板
const SEARCH_QUERIES = {
    openclaw: [
        'OpenClaw AI agent framework tutorial 2026',
        'OpenClaw skills hooks automation',
        'OpenClaw multi-agent collaboration',
        'OpenClaw cron jobs scheduling',
        'OpenClaw Telegram Discord integration'
    ],
    'claude-code': [
        'Claude Code CLI advanced tips 2026',
        'Claude Code MCP protocol integration',
        'Claude Code custom skills tutorial',
        'Claude Code batch operations',
        'Anthropic Claude Code best practices'
    ]
};

/**
 * 调用 Tavily API 搜索
 */
async function searchTavily(query, days = 7) {
    if (!CONFIG.tavilyApiKey) {
        console.warn('⚠️  TAVILY_API_KEY 未配置，使用示例内容');
        return [];
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.tavilyApiKey}`
            },
            body: JSON.stringify({
                query: query,
                days: days,
                max_results: 5,
                include_answer: true,
                include_raw_content: true
            })
        });

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`搜索失败 "${query}":`, error.message);
        return [];
    }
}

/**
 * 从搜索结果生成文案
 */
function generatePost(results, category) {
    const posts = [];

    for (const result of results) {
        const title = result.title || '未命名';
        const content = result.content || result.raw_content || '';
        
        // 生成摘要（前 150 字）
        const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');

        // 估算阅读时间（每 300 字 1 分钟）
        const readTime = `${Math.max(1, Math.ceil(content.length / 300))}分钟`;

        // 提取标签
        const tags = extractTags(content, category);

        posts.push({
            id: `${category.substring(0, 2)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: formatTitle(title, category),
            content: formatContent(content, category),
            excerpt: excerpt,
            date: new Date().toISOString(),
            readTime: readTime,
            tags: tags,
            source: result.url || ''
        });
    }

    return posts;
}

/**
 * 从内容提取标签
 */
function extractTags(content, category) {
    const baseTags = {
        openclaw: ['OpenClaw', 'AI 工具', '自动化', '技术干货'],
        'claude-code': ['ClaudeCode', 'AI 编程', '编程工具', '技术干货']
    };

    const keywords = {
        'hook': 'Hooks',
        'skill': '技能系统',
        'cron': '定时任务',
        'agent': 'AI 代理',
        'mcp': 'MCP 协议',
        'cli': '命令行',
        'git': 'Git',
        'api': 'API'
    };

    const tags = [...baseTags[category] || []];

    for (const [keyword, tag] of Object.entries(keywords)) {
        if (content.toLowerCase().includes(keyword)) {
            tags.push(tag);
        }
    }

    return [...new Set(tags)].slice(0, 8);
}

/**
 * 格式化标题
 */
function formatTitle(title, category) {
    const emoji = category === 'openclaw' ? '🦞' : '💻';
    const prefix = category === 'openclaw' ? 'OpenClaw' : 'Claude Code';
    
    // 如果标题不包含主题名，添加前缀
    if (!title.toLowerCase().includes(prefix.toLowerCase())) {
        return `${emoji} ${prefix}: ${title}`;
    }
    
    return `${emoji} ${title}`;
}

/**
 * 格式化内容
 */
function formatContent(content, category) {
    // 添加分类说明
    const intro = category === 'openclaw' 
        ? 'OpenClaw 技术干货' 
        : 'Claude Code 技术干货';

    return `${intro}\n\n${content}`;
}

/**
 * 加载现有文章
 */
function loadExistingPosts(category) {
    const filePath = path.join(CONFIG.contentDir, `${category}-posts.json`);
    
    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取 ${category} 文章失败:`, error.message);
        return [];
    }
}

/**
 * 保存文章
 */
function savePosts(category, posts) {
    const filePath = path.join(CONFIG.contentDir, `${category}-posts.json`);
    
    // 确保目录存在
    if (!fs.existsSync(CONFIG.contentDir)) {
        fs.mkdirSync(CONFIG.contentDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf-8');
    console.log(`✅ 已保存 ${posts.length} 篇 ${category} 文章到 ${filePath}`);
}

/**
 * 主函数
 */
async function main() {
    const category = process.argv[2] || 'all';
    
    console.log('🚀 开始搜集技术文案...\n');
    console.log(`📂 目标目录：${CONFIG.contentDir}`);
    console.log(`🔍 类别：${category}\n`);

    const categories = category === 'all' 
        ? ['openclaw', 'claude-code'] 
        : [category];

    for (const cat of categories) {
        console.log(`\n📝 搜集 ${cat} 内容...`);
        
        // 加载现有文章
        const existingPosts = loadExistingPosts(cat);
        console.log(`   现有文章：${existingPosts.length} 篇`);

        // 搜索新内容
        const queries = SEARCH_QUERIES[cat] || [];
        let newPosts = [];

        for (const query of queries) {
            console.log(`   🔍 搜索：${query}`);
            const results = await searchTavily(query);
            const posts = generatePost(results, cat);
            newPosts = [...newPosts, ...posts];
        }

        console.log(`   📄 新文章：${newPosts.length} 篇`);

        // 合并文章（去重，保留最新的）
        const allPosts = [...newPosts, ...existingPosts]
            .filter((post, index, self) => 
                index === self.findIndex(p => p.title === post.title)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, CONFIG.maxPosts);

        // 保存
        savePosts(cat, allPosts);
    }

    console.log('\n✅ 文案搜集完成！\n');
}

// 运行
main().catch(console.error);
