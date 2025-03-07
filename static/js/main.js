class DashboardGrid {
    constructor() {
        this.data = [];
        this.gridItems = document.querySelectorAll('.grid-item');
        this.setupRefreshButton();
    }

    async initialize() {
        try {
            await this.loadData();
            this.distributeContent();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        }
    }

    setupRefreshButton() {
        const refreshButton = document.querySelector('.refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshContent();
            });
        }
    }

    async refreshContent() {
        this.distributeContent();
    }

    async loadData() {
        try {
            const response = await fetch('/static/data.csv');
            const csvText = await response.text();
            this.data = Papa.parse(csvText, { header: true }).data.filter(item => item.ID);
            console.log('Loaded data:', this.data);
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    displayContent(gridItem, type, data) {
        const content = gridItem.querySelector('.content');
        content.innerHTML = '';

        // Add size classes based on content type
        gridItem.className = 'grid-item';
        if (type === 'iframe') {
            gridItem.classList.add('grid-item--wide');
        }
        if (type === 'summary' && data.summary && data.summary.length > 200) {
            gridItem.classList.add('grid-item--tall');
        }

        switch (type) {
            case 'iframe':
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframe-container';
                const iframe = document.createElement('iframe');
                iframe.src = `https://domo.domo.com/embed/card/private/${data.embedCode}`;
                iframe.frameBorder = "0";
                iframe.allowFullscreen = true;
                iframeContainer.appendChild(iframe);
                content.appendChild(iframeContainer);
                break;

            case 'image':
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-container';
                const img = document.createElement('img');
                img.src = data.imageURL;
                img.alt = data.Title;
                img.onerror = () => {
                    img.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                };
                imgContainer.appendChild(img);
                content.appendChild(imgContainer);

                const titleDiv = document.createElement('div');
                titleDiv.className = 'title';
                titleDiv.textContent = data.Title;
                content.appendChild(titleDiv);
                break;

            case 'summary':
                const summaryDiv = document.createElement('div');
                summaryDiv.className = 'summary';
                summaryDiv.textContent = data.summary || 'No summary available';
                content.appendChild(summaryDiv);
                break;
        }
    }

    distributeContent() {
        const distribution = [];

        // Key metrics as iframes (first 3 items)
        ['4', '1', '2'].forEach(id => {
            const item = this.data.find(d => d.ID === id);
            if (item) {
                distribution.push({ type: 'iframe', data: item });
            }
        });

        // Add some images (next 3 items)
        const imageItems = this.data.filter(d => !['4', '1', '2'].includes(d.ID)).slice(0, 3);
        imageItems.forEach(item => {
            distribution.push({ type: 'image', data: item });
        });

        // Fill remaining slots with summaries
        const remainingItems = this.data.filter(d => 
            !distribution.some(dist => dist.data.ID === d.ID)
        );

        remainingItems.forEach(item => {
            distribution.push({ type: 'summary', data: item });
        });

        // Apply to grid
        this.gridItems.forEach((item, index) => {
            if (index < distribution.length) {
                const { type, data } = distribution[index];
                this.displayContent(item, type, data);
            }
        });
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardGrid();
    dashboard.initialize();
});