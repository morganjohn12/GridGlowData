class DashboardGrid {
    constructor() {
        this.data = [];
        this.charts = new Map();
        this.contentTypes = ['chart', 'image', 'title', 'summary'];
        this.gridItems = document.querySelectorAll('.grid-item');
        this.chartTypeMap = {
            'table': 'bar',
            'Line Chart': 'line',
            'heatMap': 'bar',
            'Gauge': 'doughnut',
            'Table': 'bar',
            'Map': 'bar',
            'Pie': 'pie',
            'Bar': 'bar',
            'Overlay bar': 'bar'
        };
    }

    async initialize() {
        try {
            await this.loadData();
            this.distributeContent();
            setInterval(() => this.rotateContent(), 30000); // Rotate content every 30 seconds
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        }
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

    getChartType(requestedType) {
        return this.chartTypeMap[requestedType] || 'bar';
    }

    createChart(container, type, title) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const chartType = this.getChartType(type);

        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: title,
                data: [12, 19, 3, 5, 2],
                backgroundColor: [
                    '#7A3CA3',
                    '#A82592',
                    '#F478C3',
                    '#5B89B3',
                    '#569C3C'
                ],
                borderColor: '#7A3CA3',
                borderWidth: 1
            }]
        };

        const chartConfig = {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: chartType === 'pie' || chartType === 'doughnut'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        display: chartType !== 'pie' && chartType !== 'doughnut'
                    },
                    x: {
                        display: chartType !== 'pie' && chartType !== 'doughnut'
                    }
                }
            }
        };

        return new Chart(ctx, chartConfig);
    }

    displayContent(gridItem, contentType, data) {
        const content = gridItem.querySelector('.content');
        content.innerHTML = '';

        switch (contentType) {
            case 'chart':
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                content.appendChild(chartContainer);
                const chart = this.createChart(chartContainer, data.Chart, data.Title);
                this.charts.set(gridItem.dataset.index, chart);
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
            chart: 0,
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

    rotateContent() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.distributeContent();
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardGrid();
    dashboard.initialize();
});