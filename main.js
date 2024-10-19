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
// const rsvpName = document.getElementById('rsvp-name');
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
	// rsvpName.textContent = data.name;

	rsvpFields.innerHTML = '';

	const guests = data.guests || [];
	let savedAt = new Date(data.updated_at);

	const sortedGuests = guests.sort((a, b) => {
		// adults first
		if (a.kid && !b.kid) return 1;
		if (!a.kid && b.kid) return -1;
	});

	let showingKids = false;

	sortedGuests.forEach(({ name, kid, kid_bed, is_coming }, idx) => {
		if (!name) return;

		if (!showingKids && kid) {
			showingKids = true;
			rsvpFields.innerHTML += '<br/><i>We have a limited amount of baby beds, if you are able to bring one yourself (looking at you Lithuanians!) please do so.</i><br/><br/>';
		}

		const html = `
			<fieldset class="rsvp-field">
				<div>
					<input type="checkbox" name="guest-${idx}" value="1" id="guest-${idx}" ${is_coming ? 'checked' : ''} />
					<label for="guest-${idx}">${name}</label>
				</div>

				${kid ? `
					<div class="rsvp-field-kid-bed">
						<fieldset>
							<input type="radio" name="kid_bed-${idx}" value="normal_bed" id="kid_bed-${idx}-normal_bed" ${!kid_bed || kid_bed === 'normal_bed' ? 'checked' : ''} ${is_coming ? '' : 'disabled'} />
							<label for="kid_bed-${idx}-normal_bed">Sleeps in normal bed</label>
						</fieldset>
						<fieldset>
							<input type="radio" name="kid_bed-${idx}" value="bring_own" id="kid_bed-${idx}-bring_own" ${kid_bed === 'bring_own' ? 'checked' : ''} ${is_coming ? '' : 'disabled'} />
							<label for="kid_bed-${idx}-bring_own">We will bring a baby bed</label>
						</fieldset>
						<fieldset>
							<input type="radio" name="kid_bed-${idx}" value="need_one" id="kid_bed-${idx}-need_one" ${kid_bed === 'need_one' ? 'checked' : ''} ${is_coming ? '' : 'disabled'} />
							<label for="kid_bed-${idx}-need_one">Needs a baby bed</label>
						</fieldset>
					</div>
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

		const kidBedRadioEls = document.querySelectorAll(`[name=kid_bed-${changedGuestId}]`);
		kidBedRadioEls.forEach(radioEl => {
			if (event.target.checked) {
				radioEl.disabled = false;
			} else {
				radioEl.disabled = true;
			}
		});
	});

	rsvpForm.addEventListener('submit', async event => {
		event.preventDefault();

		const formData = new FormData(event.target);
		guests.forEach((guest, idx) => {
			guest.is_coming = formData.get(`guest-${idx}`) === '1';
			guest.kid_bed = formData.get(`kid_bed-${idx}`);
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

const queryParams = new URLSearchParams(window.location.search);
const key = queryParams.get('key');

rsvpFind.querySelector('input[name=key]').value = key;
