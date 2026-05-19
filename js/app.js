// 就业和留学指南 - 交互逻辑

(function() {
  'use strict';

  // ========== 导航 ==========
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  function navigateTo(pageName) {
    pages.forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const page = document.getElementById(pageName);
    const nav = document.querySelector(`[data-page="${pageName}"]`);
    if (page) page.classList.add('active');
    if (nav) nav.classList.add('active');

    // 关闭移动端侧边栏
    sidebar.classList.remove('open');

    // 懒加载
    if (pageName === 'dashboard') renderDashboard();
    if (pageName === 'employment') renderJobs(jobData);
    if (pageName === 'study-abroad') renderStudy();
  }

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      navigateTo(page);
    });
  });

  menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
  });

  // 点击内容区关闭侧边栏（移动端）
  document.querySelector('.main-content').addEventListener('click', function() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  });

  // ========== 仪表盘 ==========
  function renderDashboard() {
    // 薪资分布图
    const salaryRanges = [
      { label: '5000以下', min: 0, max: 5000 },
      { label: '5000-8000', min: 5000, max: 8000 },
      { label: '8000-12000', min: 8000, max: 12000 },
      { label: '12000-20000', min: 12000, max: 20000 },
      { label: '20000-35000', min: 20000, max: 35000 }
    ];

    const counts = salaryRanges.map(range => {
      return jobData.filter(j => {
        const avg = (j.salaryMin + j.salaryMax) / 2;
        return avg >= range.min && avg < range.max;
      }).length;
    });

    const maxCount = Math.max(...counts, 1);

    const chartContainer = document.getElementById('salaryChart');
    if (chartContainer) {
      chartContainer.innerHTML = salaryRanges.map((r, i) => `
        <div class="chart-row">
          <span class="chart-label">${r.label}</span>
          <div class="chart-bar-bg">
            <div class="chart-bar-fill" style="width: ${(counts[i] / maxCount) * 100}%"></div>
          </div>
          <span class="chart-count">${counts[i]} 个岗位</span>
        </div>
      `).join('');
    }

    // 热门岗位表
    const topJobs = [...jobData]
      .sort((a, b) => ((b.salaryMin + b.salaryMax) / 2) - ((a.salaryMin + a.salaryMax) / 2))
      .slice(0, 8);

    const topTable = document.getElementById('topJobsTable');
    if (topTable) {
      topTable.innerHTML = topJobs.map(j => `
        <tr>
          <td><strong>${j.title}</strong></td>
          <td style="color:var(--primary);font-weight:600;">${j.salaryDesc}</td>
          <td>${j.education}</td>
          <td>${j.trainingLocation}</td>
        </tr>
      `).join('');
    }

    // 更新统计数字
    const avgSalary = Math.round(jobData.reduce((s, j) => s + (j.salaryMin + j.salaryMax) / 2, 0) / jobData.length);
    const avgEl = document.getElementById('avgSalary');
    if (avgEl) avgEl.textContent = avgSalary.toLocaleString();

    const cities = new Set(jobData.map(j => j.trainingLocation.split('/')[0].trim()));
    const cityEl = document.getElementById('cityCount');
    if (cityEl) cityEl.textContent = cities.size;
  }

  // ========== 就业板块 ==========
  function renderJobs(jobs) {
    const grid = document.getElementById('jobGrid');
    const resultCount = document.getElementById('resultCount');
    if (!grid) return;

    grid.innerHTML = jobs.map(j => `
      <div class="job-card" data-id="${j.id}">
        <div class="job-card-header">
          <span class="job-card-title">${j.title}</span>
          <span class="job-card-id">#${j.id}</span>
        </div>
        <div class="job-card-salary">${j.salaryDesc}</div>
        <div class="job-card-info">
          <span class="job-tag">${j.education}</span>
          <span class="job-tag">${j.ageRange}</span>
          <span class="job-tag">${j.category}</span>
          ${j.tags.slice(0, 2).map(t => `<span class="job-tag highlight">${t}</span>`).join('')}
        </div>
        <div class="job-card-requirements">${j.requirements}</div>
        <div class="job-card-footer">
          <span class="job-card-location">📍 ${j.trainingLocation}</span>
          <span class="job-card-fee">💰 ${j.trainingFee}</span>
        </div>
      </div>
    `).join('');

    if (resultCount) {
      resultCount.textContent = `显示 ${jobs.length} 个岗位`;
    }

    // 点击岗位卡片打开详情弹窗
    grid.querySelectorAll('.job-card').forEach(card => {
      card.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        const job = jobData.find(j => j.id === id);
        if (job) showJobModal(job);
      });
    });

    // 填充地点筛选选项
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter && locationFilter.options.length <= 1) {
      const locations = [...new Set(jobData.map(j => j.trainingLocation))].sort();
      locations.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc;
        opt.textContent = loc;
        locationFilter.appendChild(opt);
      });
    }
  }

  function showJobModal(job) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close">&times;</button>
        <h3>${job.title} <span style="color:var(--text-muted);font-size:0.8rem;">#${job.id}</span></h3>
        <div class="modal-salary">${job.salaryDesc}</div>
        <div class="modal-section">
          <h4>岗位要求</h4>
          <p>${job.requirements}</p>
        </div>
        <div class="modal-section">
          <h4>学历要求</h4>
          <p>${job.education} | 年龄: ${job.ageRange} | 类别: ${job.category}</p>
        </div>
        <div class="modal-section">
          <h4>福利待遇</h4>
          <p>${job.benefits}</p>
        </div>
        <div class="modal-section">
          <h4>培训信息</h4>
          <p>地点: ${job.trainingLocation} | 周期: ${job.trainingDuration} | 费用: ${job.trainingFee}</p>
        </div>
        ${job.highlights.length ? `
        <div class="modal-section">
          <h4>亮点</h4>
          <ul>${job.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
        </div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  // 筛选功能
  function filterJobs() {
    const search = (document.getElementById('jobSearch')?.value || '').toLowerCase();
    const edu = document.getElementById('eduFilter')?.value || '';
    const salary = document.getElementById('salaryFilter')?.value || '';
    const loc = document.getElementById('locationFilter')?.value || '';

    const filtered = jobData.filter(j => {
      if (search && !j.title.includes(search) && !j.category.includes(search) && !j.requirements.includes(search)) return false;
      if (edu && !j.education.includes(edu)) return false;
      if (loc && j.trainingLocation !== loc) return false;
      if (salary) {
        const avg = (j.salaryMin + j.salaryMax) / 2;
        const [min, max] = salary.split('-').map(s => parseInt(s) || (s === '30000+' ? Infinity : 0));
        if (max === Infinity) { if (avg < 30000) return false; }
        else { if (avg < min || avg >= max) return false; }
      }
      return true;
    });

    renderJobs(filtered);
  }

  document.getElementById('jobSearch')?.addEventListener('input', filterJobs);
  document.getElementById('eduFilter')?.addEventListener('change', filterJobs);
  document.getElementById('salaryFilter')?.addEventListener('change', filterJobs);
  document.getElementById('locationFilter')?.addEventListener('change', filterJobs);
  document.getElementById('resetFilters')?.addEventListener('click', function() {
    const searchEl = document.getElementById('jobSearch');
    const eduEl = document.getElementById('eduFilter');
    const salaryEl = document.getElementById('salaryFilter');
    const locEl = document.getElementById('locationFilter');
    if (searchEl) searchEl.value = '';
    if (eduEl) eduEl.value = '';
    if (salaryEl) salaryEl.value = '';
    if (locEl) locEl.value = '';
    renderJobs(jobData);
  });

  // ========== 留学板块 ==========
  function renderStudy() {
    const grid = document.getElementById('studyGrid');
    if (!grid) return;

    const countryFlags = {
      '韩国': '🇰🇷',
      '新加坡': '🇸🇬',
      '美国': '🇺🇸',
      '马来西亚': '🇲🇾',
      '俄罗斯 (公费留学)': '🇷🇺'
    };

    grid.innerHTML = studyData.map(s => `
      <div class="study-card">
        <div class="study-card-header">
          <div>
            <h3>${s.country}</h3>
            <p style="font-size:0.82rem;opacity:0.85;">${s.description}</p>
          </div>
          <span class="study-card-country">${countryFlags[s.country] || '🎓'}</span>
        </div>
        <div class="study-card-body">
          <p class="study-card-desc"><strong>推荐院校：</strong></p>
          <div class="study-universities">
            ${s.universities.map(u => `<span class="study-uni-tag">${u}</span>`).join('')}
          </div>
          <ul class="study-highlights">
            ${s.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:8px;">🏷 ${s.feature}</p>
        </div>
        <div class="study-card-footer">
          <div class="study-finance">
            <div class="study-finance-item">
              <span class="study-finance-label">学费</span>
              <span class="study-finance-value">${s.tuitionRange}</span>
            </div>
            <div class="study-finance-item">
              <span class="study-finance-label">生活费</span>
              <span class="study-finance-value">${s.livingCost}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ========== 初始化 ==========
  function init() {
    renderDashboard();
    renderJobs(jobData);
    renderStudy();

    // 默认显示仪表盘
    navigateTo('dashboard');
  }

  // 键盘快捷键：关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal-overlay');
      if (modal) modal.remove();
    }
  });

  init();
})();
