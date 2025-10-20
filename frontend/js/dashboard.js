/**
 * Dashboard - Load and display data from SQLite
 */

const API_BASE_URL = 'http://localhost:9990';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadAnalytics(); // Load analytics charts
    loadCVs();
    loadJobs();
    loadApplications();
});

// ===== LOAD STATISTICS =====

async function loadStatistics() {
    try {
        // Load CVs count
        const cvsResponse = await fetch(`${API_BASE_URL}/cvs`);
        const cvs = cvsResponse.ok ? await cvsResponse.json() : [];
        document.getElementById('totalCVs').textContent = cvs.length;

        // Load Jobs count
        const jobsResponse = await fetch(`${API_BASE_URL}/jobs?limit=1`);
        if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            document.getElementById('totalJobs').textContent = jobsData.total || 0;
        }

        // Load Applications count (from all CVs)
        let totalApplications = 0;
        for (const cv of cvs) {
            const appResponse = await fetch(`${API_BASE_URL}/applications/${cv.id}`);
            if (appResponse.ok) {
                const apps = await appResponse.json();
                totalApplications += (Array.isArray(apps) ? apps.length : 0);
            }
        }
        document.getElementById('totalApplications').textContent = totalApplications;

        // Match logs - placeholder
        document.getElementById('totalMatches').textContent = '0';

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// ===== LOAD CVS =====

async function loadCVs() {
    const tbody = document.getElementById('cvsTableBody');
    
    try {
        const response = await fetch(`${API_BASE_URL}/cvs`);
        
        if (!response.ok) {
            throw new Error(`Failed to load CVs: ${response.statusText}`);
        }
        
        const cvs = await response.json();
        console.log('CVs loaded:', cvs);
        
        if (cvs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có CV nào</td></tr>';
            return;
        }
        
        let html = '';
        cvs.forEach(cv => {
            const cvInfo = cv.cv_info || {};
            const skills = cvInfo.skills || [];
            const skillsText = skills.slice(0, 3).join(', ') + (skills.length > 3 ? '...' : '');
            
            html += `
                <tr>
                    <td>${cv.id}</td>
                    <td>${cvInfo.name || 'N/A'}</td>
                    <td>${cvInfo.email || 'N/A'}</td>
                    <td>${cvInfo.phone || 'N/A'}</td>
                    <td class="truncate" title="${skills.join(', ')}">${skillsText || 'N/A'}</td>
                    <td>${formatDate(cv.upload_timestamp)}</td>
                    <td>
                        <a href="cv-analysis.html?cv_id=${cv.id}" class="btn btn-sm btn-default">Xem</a>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading CVs:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// ===== LOAD JOBS =====

async function loadJobs() {
    const tbody = document.getElementById('jobsTableBody');
    
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?limit=10`);
        
        if (!response.ok) {
            throw new Error(`Failed to load jobs: ${response.statusText}`);
        }
        
        const data = await response.json();
        const jobs = data.jobs || [];
        console.log('Jobs loaded:', jobs.length);
        
        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có việc làm nào</td></tr>';
            return;
        }
        
        let html = '';
        jobs.forEach(job => {
            const location = job.work_location || 'N/A';
            const shortLocation = location.length > 30 ? location.substring(0, 30) + '...' : location;
            
            html += `
                <tr>
                    <td>${job.id}</td>
                    <td class="truncate" title="${job.job_title}">${job.job_title || 'N/A'}</td>
                    <td class="truncate" title="${job.name}">${job.name || 'N/A'}</td>
                    <td class="truncate" title="${location}">${shortLocation}</td>
                    <td>${job.salary || 'Thỏa thuận'}</td>
                    <td>${job.experience || 'N/A'}</td>
                    <td>${job.deadline || 'N/A'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// ===== LOAD APPLICATIONS =====

async function loadApplications() {
    const tbody = document.getElementById('applicationsTableBody');
    
    try {
        // First, get all CVs
        const cvsResponse = await fetch(`${API_BASE_URL}/cvs`);
        if (!cvsResponse.ok) {
            throw new Error('Failed to load CVs');
        }
        
        const cvs = await cvsResponse.json();
        
        // Then, get applications for each CV
        let allApplications = [];
        for (const cv of cvs) {
            const appResponse = await fetch(`${API_BASE_URL}/applications/${cv.id}`);
            if (appResponse.ok) {
                const apps = await appResponse.json();
                if (Array.isArray(apps)) {
                    apps.forEach(app => {
                        app.cv_info = cv.cv_info;
                    });
                    allApplications = allApplications.concat(apps);
                }
            }
        }
        
        console.log('Applications loaded:', allApplications.length);
        
        if (allApplications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có đơn ứng tuyển nào</td></tr>';
            return;
        }
        
        let html = '';
        allApplications.forEach(app => {
            const statusClass = app.status === 'pending' ? 'badge-pending' : 
                              app.status === 'approved' ? 'badge-approved' : 'badge-rejected';
            const statusText = app.status === 'pending' ? 'Đang chờ' : 
                             app.status === 'approved' ? 'Chấp nhận' : 'Từ chối';
            
            html += `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.cv_info?.name || 'N/A'}</td>
                    <td class="truncate">${app.job_title || 'N/A'}</td>
                    <td class="truncate">${app.company_name || 'N/A'}</td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                    <td>${formatDate(app.applied_at)}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading applications:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// ===== HELPER FUNCTIONS =====

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        return dateString;
    }
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge-status badge-pending">Đang chờ</span>',
        'approved': '<span class="badge-status badge-approved">Chấp nhận</span>',
        'rejected': '<span class="badge-status badge-rejected">Từ chối</span>'
    };

    return badges[status] || '<span class="badge-status badge-pending">N/A</span>';
}

// ===== LOAD ANALYTICS =====

async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/analytics`);

        if (!response.ok) {
            throw new Error(`Failed to load analytics: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Analytics data:', data);

        // Render charts
        renderTopJobTitlesChart(data.top_job_titles);
        renderTopCompaniesChart(data.top_companies);
        renderLocationChart(data.location_distribution);
        renderJobTypeChart(data.job_type_distribution);
        renderExperienceChart(data.experience_distribution);
        renderSalaryChart(data.salary_distribution);

        // Render salary table with progress bars
        renderTopSalaryTable(data.salary_distribution, data.total_jobs);

        // Update deadline stats
        document.getElementById('expiring7Days').textContent = data.deadline_stats.expiring_7_days;
        document.getElementById('expiring30Days').textContent = data.deadline_stats.expiring_30_days;
        document.getElementById('totalWithDeadline').textContent = data.deadline_stats.total_with_deadline;

    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// ===== CHART RENDERING FUNCTIONS =====

function renderTopJobTitlesChart(data) {
    const ctx = document.getElementById('topJobTitlesChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.title),
            datasets: [{
                label: 'Số lượng',
                data: data.map(item => item.count),
                backgroundColor: '#3C65F5',
                borderColor: '#3C65F5',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('topJobTitlesChart', 'top_jobs', data);
}

function renderTopCompaniesChart(data) {
    const ctx = document.getElementById('topCompaniesChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.company),
            datasets: [{
                label: 'Số lượng',
                data: data.map(item => item.count),
                backgroundColor: '#05A081',
                borderColor: '#05A081',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('topCompaniesChart', 'top_companies', data);
}

function renderLocationChart(data) {
    const ctx = document.getElementById('locationChart');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.location),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#3C65F5', '#05A081', '#FFB800', '#FF6B6B', '#4ECDC4',
                    '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('locationChart', 'location', data);
}

function renderJobTypeChart(data) {
    const ctx = document.getElementById('jobTypeChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.type),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: ['#3C65F5', '#05A081', '#FFB800', '#FF6B6B', '#4ECDC4', '#95E1D3']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('jobTypeChart', 'job_type', data);
}

function renderExperienceChart(data) {
    const ctx = document.getElementById('experienceChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.experience),
            datasets: [{
                label: 'Số lượng',
                data: data.map(item => item.count),
                backgroundColor: '#FFB800',
                borderColor: '#FFB800',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('experienceChart', 'experience', data);
}

function renderSalaryChart(data) {
    const ctx = document.getElementById('salaryChart');
    // Only show top 10 salary ranges
    const top10 = data.slice(0, 10);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(item => item.salary),
            datasets: [{
                label: 'Số lượng',
                data: top10.map(item => item.count),
                backgroundColor: '#FF6B6B',
                borderColor: '#FF6B6B',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y', // Horizontal bar
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });

    // Add AI analysis button
    addChartAnalysisButton('salaryChart', 'salary', data);
}

// ===== TABLE RENDERING FUNCTIONS WITH HIGHLIGHTS =====

function renderTopSalaryTable(data, totalJobs) {
    const tbody = document.getElementById('topSalaryTable');
    const top10 = data.slice(0, 10);

    if (top10.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có dữ liệu</td></tr>';
        return;
    }

    let html = '';
    top10.forEach((item, index) => {
        const rank = index + 1;
        const rowClass = rank <= 3 ? `salary-rank-${rank}` : '';
        const percentage = ((item.count / totalJobs) * 100).toFixed(1);
        html += `
            <tr class="${rowClass}">
                <td><span class="rank-badge">${rank}</span></td>
                <td><strong>${item.salary}</strong></td>
                <td class="text-end"><span class="count-badge">${item.count}</span></td>
                <td class="text-end"><strong>${percentage}%</strong></td>
                <td>
                    <div class="progress-bar-custom">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== CHART ANALYSIS FUNCTIONS =====

// Add analysis button to chart with LLM-powered insights
function addChartAnalysisButton(chartId, chartType, chartData) {
    const chartCanvas = document.getElementById(chartId);
    if (!chartCanvas) {
        console.warn(`Chart ${chartId} not found`);
        return;
    }

    const chartContainer = chartCanvas.parentElement;

    // Check if button already exists
    if (chartContainer.querySelector('.chart-analysis-btn')) {
        return;
    }

    // Create button
    const btn = document.createElement('button');
    btn.className = 'chart-analysis-btn';
    btn.innerHTML = '💡';
    btn.title = 'Xem phân tích AI';
    btn.onclick = () => toggleChartAnalysis(chartId, chartType, chartData);

    // Style button
    Object.assign(btn.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#9777fa',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '10',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(151, 119, 250, 0.3)'
    });

    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 4px 12px rgba(151, 119, 250, 0.5)';
    };
    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 2px 8px rgba(151, 119, 250, 0.3)';
    };

    // Make container relative
    chartContainer.style.position = 'relative';
    chartContainer.appendChild(btn);

    // Create analysis box (hidden)
    const analysisBox = document.createElement('div');
    analysisBox.id = `analysis-${chartId}`;
    analysisBox.className = 'chart-analysis-box';
    analysisBox.style.display = 'none';
    analysisBox.innerHTML = `
        <div class="alert alert-light border-start border-warning border-4 mt-3">
            <h6 class="mb-2">💡 Phân Tích AI:</h6>
            <p class="mb-0 text-muted">Đang tải phân tích...</p>
        </div>
    `;

    chartContainer.appendChild(analysisBox);
}

// Toggle analysis visibility and generate AI insights
async function toggleChartAnalysis(chartId, chartType, chartData) {
    const analysisBox = document.getElementById(`analysis-${chartId}`);
    if (!analysisBox) return;

    if (analysisBox.style.display === 'none') {
        analysisBox.style.display = 'block';
        analysisBox.style.animation = 'slideDown 0.3s ease';

        // Check if already loaded
        const contentP = analysisBox.querySelector('p');
        if (contentP && contentP.textContent !== 'Đang tải phân tích...') {
            return; // Already loaded
        }

        // Generate AI analysis
        try {
            console.log(`🤖 Generating AI analysis for ${chartType}...`);

            const response = await fetch(`${API_BASE_URL}/jobs/analytics/insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chart_type: chartType,
                    data: chartData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            const analysis = result.analysis || 'Không thể tạo phân tích.';

            // Update content
            analysisBox.innerHTML = `
                <div class="alert alert-light border-start border-warning border-4 mt-3">
                    <h6 class="mb-2">💡 Phân Tích AI:</h6>
                    <p class="mb-0">${analysis}</p>
                </div>
            `;

            console.log(`✅ AI analysis generated for ${chartType}`);

        } catch (error) {
            console.error('❌ Error generating AI analysis:', error);
            analysisBox.innerHTML = `
                <div class="alert alert-danger border-start border-danger border-4 mt-3">
                    <h6 class="mb-2">❌ Lỗi:</h6>
                    <p class="mb-0">Không thể tạo phân tích. Vui lòng thử lại sau.</p>
                </div>
            `;
        }
    } else {
        analysisBox.style.display = 'none';
    }
}

// Make function global
window.toggleChartAnalysis = toggleChartAnalysis;

