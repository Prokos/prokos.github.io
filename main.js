const { createClient } = supabase;
const SUPABASE_URL = 'https://asvezzujmmovbbaycpqe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmV6enVqbW1vdmJiYXljcHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4MTc4NzksImV4cCI6MjAzOTM5Mzg3OX0.afW8plWDS1BrHmKATwP4-sxnJfOI4asMEo5lHATn52g';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
	const { data, error } = await client.rpc('getVisitorByKey', { value: '' })
	console.info(data, error);
})();

const rsvpFind = document.getElementById('rsvp-find');
const rsvpResult = document.getElementById('rsvp-result');
const rsvpName = document.getElementById('rsvp-name');
const rsvpForm = document.getElementById('rsvp-form');
const rsvpKidsAndBabies = document.getElementById('rsvp-kids-and-babies');

rsvpFind.addEventListener('submit', async event => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const key = formData.get('key');

	const { data, error } = await client.rpc('getVisitorByKey', { value: key })

	if (error) {
		console.error(error);
		return;
	}

	if (data === null) {
		alert('Visitor not found');
		return;
	}

	rsvpFind.style.display = 'none';
	rsvpResult.style.display = 'block';
	rsvpName.textContent = data.name;

	let adults = data.number_of_adults;
	let kids = data.number_of_kids;
	let babies = data.number_of_babies;
	let savedAt = new Date(data.updated_at);

	document.getElementById('saved-at').textContent = data.updated_at ? 'RSVP last updated ' + savedAt.toLocaleString() : '';

	rsvpForm.addEventListener('change', event => {
		const formData = new FormData(event.target.form);

		adults = parseInt(formData.get('adults'));
		kids = adults > 0 ? parseInt(formData.get('kids')) : 0;
		babies = adults > 0 ? parseInt(formData.get('babies')) : 0;

		rsvpKidsAndBabies.style.display = adults > 0 ? 'block' : 'none';
	});

	rsvpForm.addEventListener('submit', async event => {
		event.preventDefault();

		const { data, error } = await client.rpc('updateVisitorRSVP', {
			adults,
			kids,
			babies,
			value: key,
		});

		if (error) {
			console.error(error);
			return;
		}

		savedAt = new Date(Date.now());

		document.getElementById('saved-at').textContent = 'RSVP last updated ' + savedAt.toLocaleString();
	});
});
