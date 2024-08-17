const symbolContainer = document.getElementById('symbols');
let generatedAtWidthXHeight = 0;

const generate = (width, height) => {
	if (width < 1000) return;

	const symbols = [
		'windmill.png',
		'bike.png',
		'pagan-1.png',
		'pagan-2.png',
	];

	generatedAtWidthXHeight = width * height;

	new FastPoissonDiskSampling({
		shape: [width, height],
		radius: 250,
		tries: 10
	}).fill()
		.map(([x, y], idx) => {
			const img = document.createElement('img');
			img.src = `assets/${symbols[idx % symbols.length]}`;

			img.className = 'symbol';
			img.style.left = `${x / width * 100}%`;
			img.style.top = `${y / height * 100}%`;
			img.style.animationDelay = `${Math.random() * -10}s`;

			symbolContainer.appendChild(img);
		});
};

const width = window.innerWidth;
const height = window.innerHeight;
generate(width, height);

window.addEventListener('resize', () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	const newGeneratedAtWidthXHeight = width * height;

	if (Math.abs(newGeneratedAtWidthXHeight - generatedAtWidthXHeight) > 100000) {
		symbolContainer.innerHTML = '';
		generate(width, height);
	}
});
