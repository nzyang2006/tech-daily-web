// 技术日报网站脚本

let allPosts = [];
let currentFilter = 'all';

// 加载文章数据
async function loadPosts() {
    try {
        const [openclawRes, claudeCodeRes] = await Promise.all([
            fetch('../content/openclaw-posts.json'),
            fetch('../content/claude-code-posts.json')
        ]);

        const openclawPosts = await openclawRes.json();
        const claudeCodePosts = await claudeCodeRes.json();

        // 合并并排序
        allPosts = [
            ...(openclawPosts || []).map(post => ({ ...post, category: 'openclaw' })),
            ...(claudeCodePosts || []).map(post => ({ ...post, category: 'claude-code' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        updateLastUpdateTime();
        renderPosts();
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('posts-container').innerHTML = `
            <div class="empty-state">
                <h3>暂无内容</h3>
                <p>内容正在收集中，请稍后再来查看</p>
            </div>
        `;
    }
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeStr;
}

// 渲染文章列表
function renderPosts() {
    const container = document.getElementById('posts-container');
    
    const filteredPosts = currentFilter === 'all' 
        ? allPosts 
        : allPosts.filter(post => post.category === currentFilter);

    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>暂无文章</h3>
                <p>该分类下还没有内容</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredPosts.map((post, index) => `
        <div class="post-card ${post.category}" data-index="${allPosts.indexOf(post)}">
            <span class="post-category ${post.category}">${post.category === 'openclaw' ? '🦞 OpenClaw' : '💻 Claude Code'}</span>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-excerpt">${post.excerpt || post.content?.substring(0, 150) + '...' || '暂无摘要'}</p>
            <div class="post-meta">
                <span>📅 ${formatDate(post.date)}</span>
                <span>⏱️ ${post.readTime || '2 分钟'}</span>
            </div>
            ${post.tags ? `
                <div class="post-tags">
                    ${post.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');

    // 添加点击事件
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.dataset.index;
            openModal(allPosts[index]);
        });
    });
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // 今天
    if (diff < 24 * 60 * 60 * 1000) {
        return '今天';
    }
    // 昨天
    if (diff < 48 * 60 * 60 * 1000) {
        return '昨天';
    }
    // 其他
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 打开详情弹窗
function openModal(post) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <span class="post-category ${post.category}">${post.category === 'openclaw' ? '🦞 OpenClaw' : '💻 Claude Code'}</span>
                <h2>${post.title}</h2>
                <div class="post-meta" style="margin-bottom: 20px;">
                    <span>📅 ${new Date(post.date).toLocaleString('zh-CN')}</span>
                    <span>⏱️ ${post.readTime || '2 分钟'}</span>
                </div>
                <div class="content">${renderContent(post.content)}</div>
                ${post.tags ? `
                    <div class="post-tags" style="margin-top: 30px;">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 关闭事件
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // ESC 关闭
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}

// 渲染内容（支持简单的 Markdown）
function renderContent(content) {
    if (!content) return '<p>暂无内容</p>';
    
    // 简单的 Markdown 转换
    return content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\n/gim, '<br>');
}

// 筛选功能
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderPosts();
    });
});

// 初始化
document.addEventListener('DOMContentLoaded', loadPosts);
