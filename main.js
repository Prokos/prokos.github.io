let truthIdx = 0;
const truths = [
	'You have chosen the truth',
	'The truth is out there',
	'The truth will set you free',
	'The truth is a lie',
	'The truth is a lie, but a lie is a truth',
	'Yes, truth for you',
	'No, truth for you',
	'Yes, truth for me',
	'No, truth for me',
	'Please, no more truth',
	'Please, more truth',
]

document.getElementById('truth').addEventListener('click', () => {
	document.getElementById('truth-destination').innerText = truths[truthIdx++ % truths.length];
});
