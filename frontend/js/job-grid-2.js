/**
 * Job Grid 2 - Dynamic Job Listing with Filters
 */

const API_BASE_URL = 'http://localhost:9990';

// State
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 20;
let currentFilters = {
    search: '',
    location: '',
    experience: '',
    salary: '',
    sort: 'newest'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Job Grid 2 Initialized');
    loadJobs();
    initializeFilters();
});

// ===== LOAD JOBS FROM API =====

async function loadJobs() {
    try {
        console.log('Loading jobs from API...');

        // Remove limit to get all jobs (3237 total)
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        allJobs = data.jobs || [];
        filteredJobs = [...allJobs];

        console.log(`✅ Loaded ${allJobs.length} jobs`);
        console.log(`📊 Total jobs in database: ${data.total || allJobs.length}`);

        // Update title with total from database
        const totalJobs = data.total || allJobs.length;
        const titleElement = document.getElementById('jobCountTitle');
        if (titleElement) {
            titleElement.textContent = `Có ${totalJobs.toLocaleString('vi-VN')} Việc Làm Dành Cho Bạn!`;
            console.log(`✅ Updated title: ${titleElement.textContent}`);
        } else {
            console.error('❌ Element jobCountTitle not found!');
        }

        // Populate location filter
        populateLocationFilter();

        // Apply filters and render
        applyFilters();
        
    } catch (error) {
        console.error('❌ Error loading jobs:', error);
        showError('Không thể tải danh sách việc làm. Vui lòng thử lại sau.');
    }
}

// ===== RENDER JOBS =====

function renderJobs() {
    const container = document.querySelector('.job-listing-grid-2');
    if (!container) {
        console.error('Container .job-listing-grid-2 not found');
        return;
    }
    
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const jobsToShow = filteredJobs.slice(start, end);
    
    if (jobsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <img src="assets/imgs/theme/icons/icon-search.svg" alt="No jobs" style="width: 100px; opacity: 0.5;">
                <h5 class="mt-3 text-muted">Không tìm thấy việc làm nào</h5>
                <p class="text-muted">Vui lòng thử lại với bộ lọc khác</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    jobsToShow.forEach((job, index) => {
        html += renderJobCard(job, index);
    });
    
    container.innerHTML = html;
}

// ===== RENDER JOB CARD =====

function renderJobCard(job, index) {
    const iconIndex = (index % 7) + 1;
    const salary = job.salary || 'Thỏa thuận';
    const location = job.work_location || 'Không xác định';
    const workType = job.work_type || 'Full time';
    const experience = job.experience || 'Không yêu cầu';
    const companyName = job.name || 'N/A';
    const jobTitle = job.job_title || 'N/A';
    const description = job.job_description || '';
    const shortDescription = description.length > 150 ? description.substring(0, 150) + '...' : description;
    
    // Extract first location if multiple
    let shortLocation = location;
    if (location.includes(':')) {
        const parts = location.split(':');
        if (parts.length > 0) {
            const cities = parts[0].split(';');
            if (cities.length > 0) {
                shortLocation = cities[0].trim();
            }
        }
    }
    if (shortLocation.length > 40) {
        shortLocation = shortLocation.substring(0, 40) + '...';
    }
    
    return `
        <div class="col-lg-4 col-md-6">
            <div class="card-grid-2 hover-up wow animate__animated animate__fadeIn" data-wow-delay=".${index}s">
                <div class="card-block-info">
                    <div class="row">
                        <div class="col-lg-12 col-12">
                            <a class="card-2-img-text card-grid-2-img-medium" href="job-single.html?id=${job.id}">
                                <span class="card-grid-2-img-small">
                                    <img alt="${companyName}"
                                         src="${job.company_logo || `assets/imgs/page/job/ui-ux${iconIndex}.svg`}"
                                         onerror="this.src='assets/imgs/theme/icons/icon-briefcase.svg'"/>
                                </span>
                                <span>${companyName}</span>
                            </a>
                            <div class="dropdowm menu-dropdown-abs">
                                <button aria-expanded="false" class="btn btn-dots btn-dots-abs-right dropdown-toggle" 
                                        data-bs-toggle="dropdown" type="button"></button>
                                <ul class="dropdown-menu dropdown-menu-light">
                                    <li><a class="dropdown-item" href="job-single.html?id=${job.id}">Xem chi tiết</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="bookmarkJob(${job.id}); return false;">Lưu việc làm</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="mt-15">
                        <span class="text-sm text-mutted-2 mr-20"><i class="fi-rr-marker"></i> ${shortLocation}</span>
                        <span class="text-sm text-mutted-2"><i class="fi-rr-briefcase"></i> ${workType}</span>
                    </div>
                    <div class="text-small mt-15">
                        ${shortDescription}
                    </div>
                    <div class="card-2-bottom mt-20">
                        <div class="row">
                            <div class="col-lg-8 col-8">
                                <span class="card-text-price">${salary}</span>
                                <span class="text-muted ml-15"><i class="fi-rr-time-fast"></i> ${experience}</span>
                            </div>
                            <div class="col-lg-4 col-4 text-end">
                                <div class="btn btn-apply-now" onclick="window.location.href='job-single.html?id=${job.id}'">
                                    Xem
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== UPDATE JOB COUNT =====

function updateJobCount() {
    const jobCountText = document.getElementById('jobCountText');

    if (jobCountText) {
        const start = (currentPage - 1) * jobsPerPage + 1;
        const end = Math.min(start + jobsPerPage - 1, filteredJobs.length);

        if (filteredJobs.length === 0) {
            jobCountText.innerHTML = '<span class="text-danger">Không tìm thấy việc làm phù hợp</span>';
        } else {
            jobCountText.innerHTML = `Hiển thị <strong>${start}-${end}</strong> trong <strong>${filteredJobs.length.toLocaleString()}</strong> việc làm`;
        }
    }
}

// ===== SETUP PAGINATION =====

function setupPagination() {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const paginationContainer = document.querySelector('.paginations');
    
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    let html = '<ul class="pager">';
    
    // Previous button
    if (currentPage > 1) {
        html += `<li><a class="pager-prev" href="#" onclick="goToPage(${currentPage - 1}); return false;"></a></li>`;
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
        html += `<li><a class="pager-number ${activeClass}" href="#" onclick="goToPage(${i}); return false;">${i}</a></li>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<li><a class="pager-next" href="#" onclick="goToPage(${currentPage + 1}); return false;"></a></li>`;
    }
    
    html += '</ul>';
    paginationContainer.innerHTML = html;
}

// ===== GO TO PAGE =====

function goToPage(page) {
    currentPage = page;
    renderJobs();
    setupPagination();
    updateJobCount();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== SHOW ERROR =====

function showError(message) {
    const container = document.querySelector('.job-listing-grid-2');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <i class="fi-rr-info"></i> ${message}
                </div>
            </div>
        `;
    }
}

// ===== BOOKMARK JOB =====

function bookmarkJob(jobId) {
    console.log('Bookmark job:', jobId);
    alert('Tính năng lưu việc làm sẽ được cập nhật sớm!');
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

    // Keep "All" option
    dropdown.innerHTML = '<li><a class="dropdown-item active" href="#" data-location="">Tất Cả Địa Điểm</a></li>';

    // Add location options
    sortedLocations.forEach(location => {
        dropdown.innerHTML += `
            <li><a class="dropdown-item" href="#" data-location="${location}">${location}</a></li>
        `;
    });
}

// ===== INITIALIZE FILTERS =====

function initializeFilters() {
    // Search form
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    // Real-time search (debounced)
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500);
        });
    }

    // Location filter
    const locationDropdown = document.getElementById('locationDropdown');
    if (locationDropdown) {
        locationDropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const location = e.target.getAttribute('data-location');
                currentFilters.location = location;
                document.getElementById('locationText').textContent =
                    location || 'Tất Cả Địa Điểm';

                // Update active class
                locationDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');

                applyFilters();
            }
        });
    }

    // Experience filter
    const experienceDropdown = document.getElementById('experienceDropdown');
    if (experienceDropdown) {
        experienceDropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const exp = e.target.getAttribute('data-exp');
                currentFilters.experience = exp;
                document.getElementById('experienceText').textContent =
                    exp || 'Tất Cả Kinh Nghiệm';

                // Update active class
                experienceDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');

                applyFilters();
            }
        });
    }

    // Salary filter
    const salaryDropdown = document.getElementById('salaryDropdown');
    if (salaryDropdown) {
        salaryDropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const salary = e.target.getAttribute('data-salary');
                currentFilters.salary = salary;
                document.getElementById('salaryText').textContent =
                    salary || 'Tất Cả Mức Lương';

                // Update active class
                salaryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');

                applyFilters();
            }
        });
    }

    // Sort filter
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const sort = e.target.getAttribute('data-sort');
                currentFilters.sort = sort;
                document.getElementById('sortText').textContent = e.target.textContent;

                // Update active class
                sortDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');

                applyFilters();
            }
        });
    }

    // Clear filters button
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearFilters();
        });
    }
}

// ===== PERFORM SEARCH =====

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
            if (!matchTitle && !matchCompany && !matchDesc) return false;
        }

        // Location filter
        if (currentFilters.location) {
            const location = job.work_location || '';
            if (!location.includes(currentFilters.location)) return false;
        }

        // Experience filter
        if (currentFilters.experience) {
            const exp = job.experience || '';
            if (!exp.includes(currentFilters.experience)) return false;
        }

        // Salary filter
        if (currentFilters.salary) {
            const salary = job.salary || '';
            if (currentFilters.salary === 'Thỏa thuận') {
                if (!salary.toLowerCase().includes('thỏa thuận') &&
                    !salary.toLowerCase().includes('thoả thuận')) return false;
            } else {
                if (!salary.includes(currentFilters.salary)) return false;
            }
        }

        return true;
    });

    // Apply sort
    if (currentFilters.sort === 'newest') {
        filteredJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (currentFilters.sort === 'oldest') {
        filteredJobs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else if (currentFilters.sort === 'salary-high' || currentFilters.sort === 'salary-low') {
        // Extract salary numbers for sorting
        filteredJobs.sort((a, b) => {
            const salaryA = extractSalaryNumber(a.salary);
            const salaryB = extractSalaryNumber(b.salary);
            return currentFilters.sort === 'salary-high' ? salaryB - salaryA : salaryA - salaryB;
        });
    }

    // Reset to first page
    currentPage = 1;

    // Update UI
    updateJobCount();
    renderJobs();
    setupPagination();
}

// ===== EXTRACT SALARY NUMBER =====

function extractSalaryNumber(salary) {
    if (!salary) return 0;
    const match = salary.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// ===== CLEAR FILTERS =====

function clearFilters() {
    // Reset filters
    currentFilters = {
        search: '',
        location: '',
        experience: '',
        salary: '',
        sort: 'newest'
    };

    // Reset UI
    document.getElementById('searchInput').value = '';
    document.getElementById('locationText').textContent = 'Tất Cả Địa Điểm';
    document.getElementById('experienceText').textContent = 'Tất Cả Kinh Nghiệm';
    document.getElementById('salaryText').textContent = 'Tất Cả Mức Lương';
    document.getElementById('sortText').textContent = 'Mới nhất';

    // Reset active classes
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('[data-location=""]').forEach(item => item.classList.add('active'));
    document.querySelectorAll('[data-exp=""]').forEach(item => item.classList.add('active'));
    document.querySelectorAll('[data-salary=""]').forEach(item => item.classList.add('active'));
    document.querySelectorAll('[data-sort="newest"]').forEach(item => item.classList.add('active'));

    // Apply filters
    applyFilters();
}

