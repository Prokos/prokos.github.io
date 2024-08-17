const lerp = (a, b, t) => a + (b - a) * t;

const symbolContainer = document.getElementById('symbols');
let generatedAtWidthXHeight = 0;

const symbols = [];
const generate = (width, height) => {
	// if (width < 1000) return;

	const images = [
		'windmill.png',
		'bike.png',
		// 'pagan-1.png',
		'pagan-2.png',
		'kibinas.png',
		'bulvyte.png',
		'king.png',
	];

	generatedAtWidthXHeight = width * height;

	new FastPoissonDiskSampling({
		shape: [width, height],
		radius: 250,
		tries: 10
	}).fill()
		.map(([x, y], idx) => {
			const img = document.createElement('img');
			img.src = `assets/${images[idx % images.length]}`;

			img.className = 'symbol';
			img.style.left = `${x / width * 100}%`;
			img.style.top = `${y / height * 100}%`;
			img.style.animationDelay = `${Math.random() * -10}s`;
			img.setAttribute('initial-left', img.style.left);
			img.setAttribute('initial-top', img.style.top);

			symbolContainer.appendChild(img);

			symbols.push(img);
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
		symbols.length = 0;

		generate(width, height);
	}
});

const pointerPosition = { x: 0, y: 0 };

document.body.addEventListener('mousemove', event => {
	pointerPosition.x = event.clientX;
	pointerPosition.y = event.clientY;
});

let imageLoadedPrevFrame = false;
let timePrevFrame = 0;
const animate = () => {
	const timeNow = performance.now();
	const timeDelta = timeNow - timePrevFrame;
	timePrevFrame = timeNow;

	symbols.forEach((symbol, idx) => {
		const x = parseFloat(symbol.getAttribute('initial-left'));
		const y = parseFloat(symbol.getAttribute('initial-top'));

		let left = x + Math.sin(timeNow / 1000 + idx) * 0.001;
		let top = y + Math.cos(timeNow / 1000 + idx) * 0.001;

		// Center symbol
		const width = symbol.width || 0;
		const height = symbol.height || 0;
		left -= width / 2 / window.innerWidth * 100;
		top -= height / 2 / window.innerHeight * 100;

		// move away from pointer when it gets close
		const dx = pointerPosition.x / window.innerWidth - x / 100;
		const dy = pointerPosition.y / window.innerHeight - y / 100;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const buffer = 1;

		if (distance < buffer) {
			const angle = Math.atan2(dy, dx);
			left -= Math.cos(angle) * (buffer - distance);
			top -= Math.sin(angle) * (buffer - distance);
		}

		const currentLeft = parseFloat(symbol.style.left);
		const currentTop = parseFloat(symbol.style.top);

		// lerp between currentLeft and target left
		const lerpFactor = 0.05;
		left = lerp(currentLeft, left, lerpFactor);
		top = lerp(currentTop, top, lerpFactor);

		// const buffer = 50;
		// if (distance < buffer) {
		// 	const angle = Math.atan2(dy, dx);
		// 	console.info(idx, Math.cos(angle) * (buffer - distance));

		// 	left = x - Math.cos(angle) * (buffer - distance);
		// 	top = y - Math.sin(angle) * (buffer - distance);
		// }

		// distance = >200; // nbo movement
		// distance < 200 // move away inversely

		// // if (distance < 50) {

		// // }

		symbol.style.left = `${left}%`;
		symbol.style.top = `${top}%`;
	});

	requestAnimationFrame(animate);
};
animate();
