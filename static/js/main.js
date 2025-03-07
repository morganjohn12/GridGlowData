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
                this.distributeContent();
            });
        }
    }

    async loadData() {
        try {
            const response = await fetch('/static/data.csv');
            const csvText = await response.text();
            this.data = Papa.parse(csvText, { header: true }).data.filter(item => item.ID);
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    getRandomContentType() {
        const types = ['image', 'iframe', 'summary'];
        return types[Math.floor(Math.random() * types.length)];
    }

    assignRandomSize(gridItem, contentType) {
        // Reset classes
        gridItem.className = 'grid-item';

        // Randomly assign sizes based on content type
        const random = Math.random();

        if (contentType === 'iframe') {
            // iframes are more likely to be large
            if (random < 0.4) {
                gridItem.classList.add('grid-item--large');
            } else if (random < 0.7) {
                gridItem.classList.add('grid-item--wide');
            }
        } else if (contentType === 'image') {
            // images can be any size
            if (random < 0.3) {
                gridItem.classList.add('grid-item--tall');
            } else if (random < 0.6) {
                gridItem.classList.add('grid-item--wide');
            }
        } else if (contentType === 'summary') {
            // summaries are more likely to be tall
            if (random < 0.4) {
                gridItem.classList.add('grid-item--tall');
            }
        }
    }

    displayContent(gridItem, data) {
        const content = gridItem.querySelector('.content');
        content.innerHTML = '';

        // Randomly select content type
        const type = this.getRandomContentType();

        // Assign random size
        this.assignRandomSize(gridItem, type);

        switch (type) {
            case 'iframe':
                if (data.embedCode) {
                    const iframeContainer = document.createElement('div');
                    iframeContainer.className = 'iframe-container';
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://domo.domo.com/embed/card/private/${data.embedCode}`;
                    iframe.frameBorder = "0";
                    iframe.allowFullscreen = true;
                    iframeContainer.appendChild(iframe);
                    content.appendChild(iframeContainer);
                }
                break;

            case 'image':
                if (data.imageURL) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    const img = document.createElement('img');
                    img.src = data.imageURL;
                    img.alt = data.Title || 'Dashboard Image';
                    img.onerror = () => {
                        img.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    };
                    imgContainer.appendChild(img);
                    content.appendChild(imgContainer);
                }
                break;

            case 'summary':
                if (data.summary) {
                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'summary';
                    summaryDiv.textContent = data.summary;
                    content.appendChild(summaryDiv);
                }
                break;
        }
    }

    distributeContent() {
        // Shuffle the data array
        const shuffledData = [...this.data]
            .sort(() => Math.random() - 0.5)
            .slice(0, 9); // Only take 9 items for 3x3 grid

        // Apply to grid
        this.gridItems.forEach((item, index) => {
            if (index < shuffledData.length) {
                this.displayContent(item, shuffledData[index]);
            }
        });
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardGrid();
    dashboard.initialize();
});