class DashboardGrid {
    constructor() {
        this.data = [];
        this.contentTypes = ['iframe', 'image', 'title', 'summary'];
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
            console.log('Loaded data:', this.data); // Debug log
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    displayContent(gridItem, contentType, data) {
        const content = gridItem.querySelector('.content');
        content.innerHTML = '';

        // Add size classes based on content type and importance
        gridItem.className = 'grid-item';
        if (contentType === 'iframe' && ['4', '1', '2'].includes(data.ID)) {
            gridItem.classList.add('grid-item--wide');
        }
        if (contentType === 'summary' && data.summary.length > 200) {
            gridItem.classList.add('grid-item--tall');
        }

        switch (contentType) {
            case 'iframe':
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframe-container';
                const iframe = document.createElement('iframe');
                const baseUrl = 'https://domo.domo.com/embed/card/private/';
                iframe.src = baseUrl + data.embedCode;
                iframe.frameBorder = "0";
                iframe.allowFullscreen = true;
                iframe.marginHeight = "0";
                iframe.marginWidth = "0";
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

                // Add title below image
                const titleDiv = document.createElement('div');
                titleDiv.className = 'title';
                titleDiv.textContent = data.Title;
                content.appendChild(titleDiv);
                break;

            case 'title':
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
        // Ensure we have enough items for each type
        const distribution = [];

        // Always show key metrics as iframes
        ['4', '1', '2'].forEach(id => {
            const item = this.data.find(d => d.ID === id);
            if (item) {
                distribution.push({ type: 'iframe', data: item });
            }
        });

        // Add some images
        const imageItems = this.data.filter(d => !['4', '1', '2'].includes(d.ID)).slice(0, 3);
        imageItems.forEach(item => {
            distribution.push({ type: 'image', data: item });
        });

        // Fill remaining slots with summaries
        while (distribution.length < this.gridItems.length) {
            const remainingItems = this.data.filter(d => 
                !distribution.some(dist => dist.data.ID === d.ID)
            );
            if (remainingItems.length === 0) break;

            const item = remainingItems[Math.floor(Math.random() * remainingItems.length)];
            distribution.push({ type: 'summary', data: item });
        }

        // Shuffle non-key metric items
        const keyMetrics = distribution.slice(0, 3);
        const otherItems = distribution.slice(3).sort(() => Math.random() - 0.5);
        const finalDistribution = [...keyMetrics, ...otherItems];

        // Apply to grid
        this.gridItems.forEach((item, index) => {
            if (index < finalDistribution.length) {
                const { type, data } = finalDistribution[index];
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