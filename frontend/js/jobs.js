/**
 * Jobs Listing Page - Load jobs from database
 */

const API_BASE_URL = 'http://localhost:9990';

// State
let currentPage = 1;
let itemsPerPage = 12;
let totalJobs = 0;
let allJobs = [];
let filteredJobs = [];
let currentFilters = {
    search: '',
    location: '',
    experience: '',
    sort: 'newest'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const locationParam = urlParams.get('location');
    
    // Set initial filters from URL
    if (searchParam) {
        document.getElementById('searchInput').value = searchParam;
        currentFilters.search = searchParam.toLowerCase();
    }
    if (locationParam) {
        currentFilters.location = locationParam;
    }
    
    loadJobs();
    initializeFilters();
    initializeSearch();
});

// ===== LOAD JOBS FROM API =====

async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?limit=1000`);
        
        if (!response.ok) {
            throw new Error(`Failed to load jobs: ${response.statusText}`);
        }

        const data = await response.json();
        allJobs = data.jobs || [];
        totalJobs = data.total || allJobs.length;
        
        console.log(`Loaded ${allJobs.length} jobs`);
        
        // Update title
        document.getElementById('jobCountTitle').textContent = 
            `Có ${totalJobs.toLocaleString()} Việc Làm Dành Cho Bạn!`;
        
        // Extract unique locations for filter
        populateLocationFilter();
        
        // Apply filters and display
        applyFilters();
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsContainer').innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    Không thể tải danh sách việc làm. Vui lòng thử lại sau.
                </div>
            </div>
        `;
    }
}

// ===== POPULATE LOCATION FILTER =====

function populateLocationFilter() {
    const locations = new Set();
    
    allJobs.forEach(job => {
        if (job.work_location) {
            // Extract city from location string
            const parts = job.work_location.split(':');
            if (parts.length > 0) {
                const cities = parts[0].split(';');
                cities.forEach(city => {
                    const trimmed = city.trim();
                    if (trimmed) locations.add(trimmed);
                });
            }
        }
    });
    
    const dropdown = document.getElementById('locationDropdown');
    const sortedLocations = Array.from(locations).sort();
    
    // Add "All" option
    dropdown.innerHTML = '<li><a class="dropdown-item" href="#" data-location="">Tất Cả Địa Điểm</a></li>';
    
    // Add location options
    sortedLocations.forEach(location => {
        dropdown.innerHTML += `
            <li><a class="dropdown-item" href="#" data-location="${location}">${location}</a></li>
        `;
    });
}

// ===== INITIALIZE FILTERS =====

function initializeFilters() {
    // Location filter
    document.getElementById('locationDropdown').addEventListener('click', function(e) {
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const location = e.target.getAttribute('data-location');
            currentFilters.location = location;
            document.getElementById('locationText').textContent = 
                location || 'Tất Cả Địa Điểm';
            applyFilters();
        }
    });
    
    // Experience filter
    document.getElementById('experienceDropdown').addEventListener('click', function(e) {
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const exp = e.target.getAttribute('data-exp');
            currentFilters.experience = exp;
            document.getElementById('experienceText').textContent = 
                exp || 'Tất Cả Kinh Nghiệm';
            applyFilters();
        }
    });
    
    // Sort filter
    document.querySelectorAll('[data-sort]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sort = this.getAttribute('data-sort');
            currentFilters.sort = sort;
            document.getElementById('sortText').textContent = this.textContent;
            
            // Update active class
            document.querySelectorAll('[data-sort]').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            applyFilters();
        });
    });
}

// ===== INITIALIZE SEARCH =====

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchForm = document.getElementById('searchForm');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Real-time search (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 500);
    });
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    currentFilters.search = searchInput.value.toLowerCase().trim();
    currentPage = 1; // Reset to first page
    applyFilters();
}

// ===== APPLY FILTERS =====

function applyFilters() {
    // Start with all jobs
    filteredJobs = allJobs.filter(job => {
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search;
            const matchTitle = (job.job_title || '').toLowerCase().includes(searchLower);
            const matchCompany = (job.name || '').toLowerCase().includes(searchLower);
            const matchDesc = (job.job_description || '').toLowerCase().includes(searchLower);
            
            if (!matchTitle && !matchCompany && !matchDesc) {
                return false;
            }
        }
        
        // Location filter
        if (currentFilters.location) {
            const jobLocation = job.work_location || '';
            if (!jobLocation.includes(currentFilters.location)) {
                return false;
            }
        }
        
        // Experience filter
        if (currentFilters.experience) {
            const jobExp = job.experience || '';
            if (!jobExp.includes(currentFilters.experience)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort
    if (currentFilters.sort === 'newest') {
        filteredJobs.sort((a, b) => b.id - a.id);
    } else if (currentFilters.sort === 'oldest') {
        filteredJobs.sort((a, b) => a.id - b.id);
    }
    
    // Update count
    document.getElementById('jobCountInfo').innerHTML = 
        `Hiển thị <strong>${Math.min(itemsPerPage, filteredJobs.length)}</strong> trong tổng số <strong>${filteredJobs.length}</strong> việc làm`;
    
    // Display jobs
    displayJobs();
}

// ===== DISPLAY JOBS =====

function displayJobs() {
    const container = document.getElementById('jobsContainer');
    
    if (filteredJobs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    Không tìm thấy việc làm phù hợp. Vui lòng thử lại với bộ lọc khác.
                </div>
            </div>
        `;
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredJobs.length);
    const pageJobs = filteredJobs.slice(startIndex, endIndex);
    
    // Render jobs
    let html = '';
    pageJobs.forEach(job => {
        html += renderJobCard(job);
    });
    
    container.innerHTML = html;
    
    // Update pagination
    updatePagination();
}

// ===== RENDER JOB CARD =====

function renderJobCard(job) {
    const salary = job.salary || 'Thỏa thuận';
    const location = job.work_location || 'Không xác định';
    const experience = job.experience || 'Không yêu cầu';
    const deadline = job.deadline || 'N/A';
    const companyLogo = job.company_logo || 'assets/imgs/theme/icons/icon-briefcase.svg';
    const jobType = job.work_type || 'Toàn thời gian';
    const level = job.level || 'Nhân viên';
    
    // Truncate location if too long
    const shortLocation = location.length > 50 ? location.substring(0, 50) + '...' : location;
    
    return `
        <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="card-grid-2 hover-up job-card">
                <div class="card-grid-2-image-left">
                    <span class="flash"></span>
                    <div class="image-box">
                        <img src="${companyLogo}" alt="${job.name}" 
                             onerror="this.src='assets/imgs/theme/icons/icon-briefcase.svg'">
                    </div>
                    <div class="right-info">
                        <a class="name-job" href="job-single.html?id=${job.id}">${job.name || 'Công ty'}</a>
                        <span class="location-small">${shortLocation}</span>
                    </div>
                </div>
                <div class="card-block-info">
                    <h6>
                        <a href="job-single.html?id=${job.id}">${job.job_title || 'Không có tiêu đề'}</a>
                    </h6>
                    <div class="mt-5">
                        <span class="card-briefcase">${jobType}</span>
                        <span class="card-time">${experience}</span>
                    </div>
                    <p class="font-sm color-text-paragraph mt-15">
                        ${(job.job_description || '').substring(0, 120)}...
                    </p>
                    <div class="mt-30">
                        <a class="btn btn-grey-small mr-5" href="#">${level}</a>
                    </div>
                    <div class="card-2-bottom mt-30">
                        <div class="row">
                            <div class="col-lg-7 col-7">
                                <span class="card-text-price">${salary}</span>
                            </div>
                            <div class="col-lg-5 col-5 text-end">
                                <div class="btn btn-apply-now" onclick="window.location.href='job-single.html?id=${job.id}'">
                                    Xem Chi Tiết
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== PAGINATION =====

function updatePagination() {
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    
    if (totalPages <= 1) {
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }
    
    document.getElementById('paginationContainer').style.display = 'block';
    
    const paginationContainer = document.querySelector('.pager');
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<li><a class="pager-prev" href="#" onclick="changePage(${currentPage - 1}); return false;"></a></li>`;
    }
    
    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li><a class="pager-number ${activeClass}" href="#" onclick="changePage(${i}); return false;">${i}</a></li>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<li><a class="pager-next" href="#" onclick="changePage(${currentPage + 1}); return false;"></a></li>`;
    }
    
    paginationContainer.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    displayJobs();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

