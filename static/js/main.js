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
        } catch (error) {
            console.error('Error loading CSV:', error);
            // Fallback to embedded data if fetch fails
            const csvData = document.getElementById('csvData').textContent;
            this.data = Papa.parse(csvData, { header: true }).data.filter(item => item.ID);
        }
    }

    displayContent(gridItem, contentType, data) {
        const content = gridItem.querySelector('.content');
        content.innerHTML = '';

        switch (contentType) {
            case 'iframe':
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframe-container';
                const iframe = document.createElement('iframe');
                iframe.src = data.cardURL;
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
                summaryDiv.textContent = data.summary;
                content.appendChild(summaryDiv);
                break;
        }
    }

    distributeContent() {
        const contentDistribution = this.generateContentDistribution();

        this.gridItems.forEach((item, index) => {
            const contentType = contentDistribution[index];
            const randomDataIndex = Math.floor(Math.random() * this.data.length);
            this.displayContent(item, contentType, this.data[randomDataIndex]);
        });
    }

    generateContentDistribution() {
        const distribution = [];
        const counts = {
            iframe: 0,
            image: 0,
            title: 0,
            summary: 0
        };

        // Ensure even distribution
        while (distribution.length < 9) {
            for (const type of this.contentTypes) {
                if (distribution.length < 9 && counts[type] < 3) {
                    distribution.push(type);
                    counts[type]++;
                }
            }
        }

        // Shuffle the distribution
        return distribution.sort(() => Math.random() - 0.5);
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardGrid();
    dashboard.initialize();
});