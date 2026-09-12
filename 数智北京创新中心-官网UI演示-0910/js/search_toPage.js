class Pagination {
  constructor(options) {
    this.container = document.getElementById(options.containerId);
    this.currentPage = options.current || 1;
    this.totalPages = options.totalPages || 1;
    this.pageSize = options.Size || 1;
    this.onPageChange = options.onPageChange || function() {};
    
    if (!this.container) {
      console.error('分页容器未找到');
      return;
    }
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
	  /* 0. 先修正当前页码 */
	this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));


	  this.container.innerHTML = '';

	  const ul = document.createElement('ul');
	  ul.className = 'pagination1';

	  // 上一页
	  const prevLi = document.createElement('li');
	  prevLi.className = this.currentPage === 1 ? 'disabled' : '';
	  prevLi.innerHTML = '<a href="javascript:void(0)" class="page-prev">上一页</a>';
	  ul.appendChild(prevLi);

	  const addPageLi = (page) => {
		const li = document.createElement('li');
		li.className = page === this.currentPage ? 'active' : '';
		li.innerHTML = `<a href="javascript:void(0)" class="page-link">${page}</a>`;
		ul.appendChild(li);
	  };

	  const addEllipsis = () => {
		const li = document.createElement('li');
		li.innerHTML = '<span>...</span>';
		ul.appendChild(li);
	  };

	  const total = this.totalPages;
	  const current = this.currentPage;

	  if (total <= 5) {
		for (let i = 1; i <= total; i++) addPageLi(i);
	  } else {
		if (current <= 3) {
		  for (let i = 1; i <= 4; i++) addPageLi(i);
		  addEllipsis();
		  addPageLi(total);
		} else if (current >= total - 2) {
		  addPageLi(1);
		  addEllipsis();
		  for (let i = total - 3; i <= total; i++) addPageLi(i);
		} else {
		  addPageLi(1);
		  addEllipsis();
		  for (let i = current - 1; i <= current + 1; i++) addPageLi(i);
		  addEllipsis();
		  addPageLi(total);
		}
	  }

	  // 下一页
	  const nextLi = document.createElement('li');
	  nextLi.className = this.currentPage === this.totalPages ? 'disabled' : '';
	  nextLi.innerHTML = '<a href="javascript:void(0)" class="page-next">下一页</a>';
	  ul.appendChild(nextLi);

	  // 总页数
	  const totalLi = document.createElement('li');
	  totalLi.innerHTML = '<span>共' + this.totalPages + '页</span>';
	  ul.appendChild(totalLi);

	  this.container.appendChild(ul);
	}
  
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (e.target.classList.contains('page-prev')) {
        if (this.currentPage > 1) {
          this.setPage(this.currentPage - 1);
        }
      } 
      else if (e.target.classList.contains('page-next')) {
        if (this.currentPage < this.totalPages) {
          this.setPage(this.currentPage + 1);
        }
      }
      else if (e.target.classList.contains('page-link')) {
        const page = parseInt(e.target.textContent);
        if (page !== this.currentPage) {
          this.setPage(page);
        }
      }
    });
  }
  
  setPage(page) {
    this.currentPage = page;
    this.render();
    this.onPageChange(page);
  }
  
  updateTotalPages(totalPages) {
    this.totalPages = totalPages;
    this.render();
  }
}