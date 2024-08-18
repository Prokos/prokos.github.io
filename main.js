const { createClient } = supabase;
const SUPABASE_URL = 'https://asvezzujmmovbbaycpqe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmV6enVqbW1vdmJiYXljcHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4MTc4NzksImV4cCI6MjAzOTM5Mzg3OX0.afW8plWDS1BrHmKATwP4-sxnJfOI4asMEo5lHATn52g';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const localeOptions = {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
};

const rsvpFind = document.getElementById('rsvp-find');
const rsvpFindSubmit = rsvpFind.querySelector('button[type=submit]');
const rsvpResult = document.getElementById('rsvp-result');
const rsvpName = document.getElementById('rsvp-name');
const rsvpForm = document.getElementById('rsvp-form');
const rsvpFields = document.getElementById('rsvp-fields');
const rsvpFormSubmit = rsvpForm.querySelector('button[type=submit]');
const cannotFind = document.getElementById('cannot-find');

rsvpFind.addEventListener('change', () => {
	cannotFind.style.display = 'none';
});

rsvpFind.addEventListener('submit', async event => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const key = formData.get('key');

	const oldText = rsvpFindSubmit.textContent;
	rsvpFindSubmit.disabled = true;
	rsvpFindSubmit.textContent = 'Searching...';

	const { data, error } = await client.rpc('getVisitorByKey', { value: key })

	rsvpFindSubmit.disabled = false;
	rsvpFindSubmit.textContent = oldText;

	if (error) {
		console.error(error);
		return;
	}

	if (data === null) {
		cannotFind.style.display = 'block';
		return;
	}

	rsvpFind.style.display = 'none';
	rsvpResult.style.display = 'block';
	rsvpName.textContent = data.name;

	rsvpFields.innerHTML = '';

	const guests = data.guests || [];
	let savedAt = new Date(data.updated_at);

	const sortedGuests = guests.sort((a, b) => {
		// adults first
		if (a.kid && !b.kid) return 1;
		if (!a.kid && b.kid) return -1;
	});

	let showingKids = false;
	sortedGuests.forEach(({ name, kid, needs_baby_bed, is_coming }, idx) => {
		if (!name) return;

		if (!showingKids && kid) {
			showingKids = true;
			rsvpFields.innerHTML += '<h3>Kids</h3>';
		}

		const html = `
			<fieldset class="rsvp-field">
				<input type="checkbox" name="guest-${idx}" value="1" id="guest-${idx}" ${is_coming ? 'checked' : ''} />
				<label for="guest-${idx}">${name}</label>

				${kid ? `
					<input type="checkbox" name="needs_baby_bed-${idx}" value="1" id="needs_baby_bed-${idx}" ${needs_baby_bed ? 'checked' : ''} ${is_coming ? '' : 'disabled'} />
					<label for="needs_baby_bed-${idx}">Needs baby bed</label>
				` : ''}
			</fieldset>
		`;

		rsvpFields.innerHTML += html;
	});

	rsvpForm.addEventListener('change', async event => {
		const [key, id] = event.target.id.split('-');
		if (key !== 'guest') return;

		const changedGuestId = id;
		const guest = guests[changedGuestId];

		if (!guest.kid) return;

		const needsBabyBedCheckbox = document.getElementById(`needs_baby_bed-${changedGuestId}`);
		if (event.target.checked) {
			needsBabyBedCheckbox.disabled = false;
		} else {
			needsBabyBedCheckbox.disabled = true;
			needsBabyBedCheckbox.checked = false;
		}
	});

	rsvpForm.addEventListener('submit', async event => {
		event.preventDefault();

		const formData = new FormData(event.target);
		guests.forEach((guest, idx) => {
			guest.is_coming = formData.get(`guest-${idx}`) === '1';
			guest.needs_baby_bed = formData.get(`needs_baby_bed-${idx}`) === '1';
		});

		const oldText = rsvpFormSubmit.textContent;

		rsvpFormSubmit.disabled = true;
		rsvpFormSubmit.textContent = 'Saving...';
		const { data, error } = await client.rpc('updateVisitorRSVP', {
			guests,
			key,
		});

		if (error) {
			console.error(error);
			return;
		}

		rsvpFormSubmit.disabled = false;
		rsvpFormSubmit.textContent = oldText

		savedAt = new Date(Date.now());

		document.getElementById('saved-at').textContent = 'RSVP last updated on ' + savedAt.toLocaleString(undefined, localeOptions);
	});

	document.getElementById('saved-at').textContent = data.updated_at ? 'RSVP last updated on ' + savedAt.toLocaleString(undefined, localeOptions) : '';
});

if (window.location.hash) {
	rsvpFind.querySelector('input[name=key]').value = window.location.hash.slice(1);
}
