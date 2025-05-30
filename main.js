const { createClient } = supabase;
const SUPABASE_URL = 'https://asvezzujmmovbbaycpqe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmV6enVqbW1vdmJiYXljcHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4MTc4NzksImV4cCI6MjAzOTM5Mzg3OX0.afW8plWDS1BrHmKATwP4-sxnJfOI4asMEo5lHATn52g';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const foodOptions = [
	{
		id: 'kid',
		label: 'Kid menu (chicken fingers + fries)',
		kidsOnly: true,
	},
	{
		id: 'no_food',
		label: 'Nothing',
		kidsOnly: true,
	},
	{
		id: 'duck',
		label: 'Duck leg',
	},
	{
		id: 'pork',
		label: 'Pork neck steak',
	},
	{
		id: 'salmon',
		label: 'Salmon steak',
	},
	{
		id: 'eggplant',
		label: 'Stuffed eggplant (vegetarian)',
	},
	{
		id: 'vegan',
		label: 'Vegan',
	},
];

const localeOptions = {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
};

const countdown = document.getElementById('countdown');
const rsvpFind = document.getElementById('rsvp-find');
const rsvpFindSubmit = rsvpFind.querySelector('button[type=submit]');
const rsvpResult = document.getElementById('rsvp-result');
const rsvpNames = document.getElementById('rsvp-names');
const rsvpSad = document.getElementById('rsvp-sad');
const rsvpComing = document.getElementById('rsvp-coming');
const rsvpForm = document.getElementById('rsvp-form');
const rsvpFields = document.getElementById('rsvp-fields');
const rsvpFormSubmit = rsvpForm.querySelector('button[type=submit]');
const cannotFind = document.getElementById('cannot-find');
const rsvpSubmitted = document.getElementById('rsvp-submitted');
const rsvpDetails = document.getElementById('rsvp-details');

rsvpFind.addEventListener('change', () => {
	cannotFind.style.display = 'none';
});

let formSaveStart;
const formSaving = () => {
	formSaveStart = Date.now();

	rsvpResult.style.opacity = 0.5;
	rsvpResult.style.pointerEvents = 'none';
};

const formDoneSaving = () => new Promise(resolve => {
	const saveTime = Date.now() - formSaveStart;

	window.setTimeout(() => {
		rsvpResult.style.opacity = 1;
		rsvpResult.style.pointerEvents = 'auto';
		resolve();
	}, Math.max(0, 500 - saveTime));
});

let data;

const renderRSVPDetails = () => {
	rsvpDetails.innerHTML = `
		<br/><strong>Your RSVP</strong><p>
		${data.guests.map(guest => {
			let text = `${guest.name} `;
			text += guest.is_coming ? 'is coming' : 'is not coming';

			if (guest.kid) {
				if (guest.kid_bed === 'normal_bed') {
					text += ', sleeps in a normal bed';
				} else if (guest.kid_bed === 'bring_own') {
					text += ', you\'ll bring a baby bed';
				} else if (guest.kid_bed === 'need_one') {
					text += ', needs a baby bed';
				}
			}

			if (guest.food) {
				text += `, eats ${foodOptions.find(({ id }) => id === guest.food)?.label}`;
			}

			return text;
		}).join('<br/>')}<br/>
		${data.extra_night ? 'You are staying an extra night' : 'You are not staying an extra night'}
		</p>
	`;
}

let formRendered = false;
const renderRSVPForm = data => {
	if (formRendered) return;
	formRendered = true;

	rsvpFields.innerHTML = '';

	const sortedGuests = (data.guests || []).sort((a, b) => {
		// adults first
		if (a.kid && !b.kid) return 1;
		if (!a.kid && b.kid) return -1;
	});

	let showingKids = false;

	sortedGuests.forEach(({ name, kid, kid_bed, is_coming, food }, idx) => {
		if (!name) return;

		if (!showingKids && kid) {
			showingKids = true;
			rsvpFields.innerHTML += '<br/><i>We have a limited amount of baby beds, if you are able to bring one yourself (looking at you Lithuanians!) please do so.<br/><br/>Main dish will be served around 20:00</i><br/><br/>';
		}

		const html = `
			<fieldset class="rsvp-field">
				<div class="rsvp-top-row">
					<div>
						<input type="checkbox" name="guest-${idx}" value="1" id="guest-${idx}" ${is_coming === true ? 'checked' : ''} />
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
				</div>

				<div class="rsvp-field-food">
					<strong>Would like to eat</strong>

					<div class="rsvp-food-fieldsets">
						${foodOptions.filter(({ kidsOnly }) => !kidsOnly || kid).map(({ id, label }, i) => `
							<fieldset>
								<input type="radio" name="food-${idx}" value="${id}" id="food-${idx}-${id}" ${food === id ? 'checked' : ''} ${is_coming ? '' : 'disabled'} />
								<label for="food-${idx}-${id}">${label}</label>
							</fieldset>
						`).join('\n')}
					</div>
				</div>
			</fieldset>
		`;

		rsvpFields.innerHTML += html;
	});

	rsvpFields.innerHTML += '<br/><p>Are you interested in staying an extra night at the venue at your own cost (€20 per person)?</p><br/>';
	rsvpFields.innerHTML += `
		<fieldset class="rsvp-field">
			<div>
				<input type="checkbox" name="extra-night" value="1" id="extra-night" ${data.extra_night ? 'checked' : ''} />
				<label for="extra-night">Yes, save us/me a spot!</label>
			</div>
		</fieldset>
	`;

	let canSubmit = false;

	const toggle = () => {
		// Toggle kid buttons
		if (data.guests.some(guest => !guest.kid && guest.is_coming)) {
			const kidCheckboxes = document.querySelectorAll('[name^=guest-]');
			kidCheckboxes.forEach(checkbox => {
				const [key, id] = checkbox.id.split('-');
				const guestId = id;
				const guest = data.guests[guestId];

				if (guest.kid) {
					checkbox.disabled = false;
				}
			});
		} else {
			const kidCheckboxes = document.querySelectorAll('[name^=guest-]');
			kidCheckboxes.forEach(checkbox => {
				const [key, id] = checkbox.id.split('-');
				const guestId = id;
				const guest = data.guests[guestId];

				if (guest.kid) {
					checkbox.disabled = true;
					checkbox.checked = false;
				}
			});
		}

		// Toggle food buttons
		const foodCheckboxes = document.querySelectorAll('[name^=food-]');
		foodCheckboxes.forEach(checkbox => {
			const [key, id] = checkbox.id.split('-');
			const guestId = id;
			const guest = data.guests[guestId];

			if (guest.is_coming) {
				checkbox.disabled = false;
			} else {
				checkbox.disabled = true;
				checkbox.checked = false;
			}
		});

		// Toggle extra night checkbox
		const extraNightCheckbox = document.getElementById('extra-night');
		if (data.guests.some(guest => guest.is_coming)) {
			extraNightCheckbox.disabled = false;
		} else {
			extraNightCheckbox.disabled = true;
			extraNightCheckbox.checked = false;
		}

		// Toggle submit button
		if (data.guests.some(guest => guest.is_coming)) {
			canSubmit = true;
			rsvpFormSubmit.disabled = false;
		} else {
			canSubmit = false;
			rsvpFormSubmit.disabled = true;
		}
	}

	toggle();

	rsvpForm.addEventListener('change', async event => {
		const formData = new FormData(rsvpForm);
		data.guests.forEach((guest, idx) => {
			guest.is_coming = formData.get(`guest-${idx}`) === '1';
			guest.kid_bed = formData.get(`kid_bed-${idx}`);
			guest.food = formData.get(`food-${idx}`);
		});

		// Toggle kid bed buttons
		const [key, id] = event.target.id.split('-');
		if (key === 'guest') {
			const changedGuestId = id;
			const guest = data.guests[changedGuestId];

			if (guest.kid) {
				const kidBedRadioEls = document.querySelectorAll(`[name=kid_bed-${changedGuestId}]`);
				kidBedRadioEls.forEach(radioEl => {
					if (event.target.checked) {
						radioEl.disabled = false;
					} else {
						radioEl.disabled = true;
					}
				});
			}
		}

		toggle();
	});

	rsvpForm.addEventListener('submit', async event => {
		event.preventDefault();

		if (!canSubmit) return;

		const formData = new FormData(event.target);
		data.guests.forEach((guest, idx) => {
			guest.is_coming = formData.get(`guest-${idx}`) === '1';
			guest.kid_bed = formData.get(`kid_bed-${idx}`);
		});

		formSaving();

		const { error } = await client.rpc('updateVisitorRSVP', {
			guests: data.guests,
			key: data.key,
			extra_night: formData.get('extra-night') === '1',
			is_coming: true,
		});

		await formDoneSaving();

		data.extra_night = formData.get('extra-night') === '1';
		data.is_coming = true;

		renderRSVPDetails();

		rsvpSubmitted.style.display = 'block';
		rsvpComing.style.display = 'none';
		rsvpForm.style.display = 'none';
		rsvpSad.style.display = 'none';

		if (error) {
			console.error(error);
			return;
		}

		// savedAt = new Date(Date.now());

		// document.getElementById('saved-at').textContent = 'RSVP last updated on ' + savedAt.toLocaleString(undefined, localeOptions);
	});

	// document.getElementById('saved-at').textContent = data.updated_at ? 'RSVP last updated on ' + savedAt.toLocaleString(undefined, localeOptions) : '';
}

const showRSVP = async key => {
	const oldText = rsvpFindSubmit.textContent;
	rsvpFindSubmit.disabled = true;
	rsvpFindSubmit.textContent = 'Searching...';

	const { data: newData, error } = await client.rpc('getVisitorByKey', { value: key })

	data = newData;

	if (data) {
		if (data.guests.length === 1 && typeof data.guests[0].is_coming === 'undefined') {
			data.guests[0].is_coming = true;
		}
	}

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

	const guestNames = data.guests.map(guest => guest.name);
	rsvpNames.innerHTML = guestNames.slice(0, -1).join(', ') + (guestNames.length > 1 ? ' & ' : '') + guestNames.slice(-1);

	document.querySelectorAll('button.coming').forEach(button => {
		button.addEventListener('click', async event => {
			const isComing = event.target.getAttribute('data-value') === 'yes';

			if (!isComing) {
				formSaving();

				const { error } = await client.rpc('updateVisitorRSVP', {
					key: data.key,
					guests: data.guests,
					extra_night: data.extra_night,
					is_coming: isComing,
				});

				await formDoneSaving();

				data.is_coming = isComing;

				renderRSVPDetails();

				if (error) {
					console.error(error);
					return;
				}
			} else {
				formSaving();
				await formDoneSaving();
			}

			rsvpComing.style.display = 'none';

			if (isComing) {
				rsvpSad.style.display = 'none';
				rsvpForm.style.display = 'block';

				renderRSVPForm(data);
			} else {
				rsvpSad.style.display = 'block';
				rsvpForm.style.display = 'none';
			}

		});
	});

	document.querySelectorAll('button.edit-rsvp').forEach(button => {
		button.addEventListener('click', async event => {
			formSaving();
			await formDoneSaving();

			// If you already said you're coming - immediately show the form
			// this prevents you from having to click the button again (but doesnt allow you to easily UNRSVP, which is fine now that we're almost there)
			if (data.is_coming === true) {
				rsvpComing.style.display = 'none';
				rsvpForm.style.display = 'block';
				rsvpSad.style.display = 'none';
				rsvpSubmitted.style.display = 'none';

				renderRSVPForm(data);
			} else {
				rsvpComing.style.display = 'block';
				rsvpForm.style.display = 'none';
				rsvpSad.style.display = 'none';
				rsvpSubmitted.style.display = 'none';

				renderRSVPForm(data);
			}
		});
	});

	if (data.is_coming === true) {
		rsvpSubmitted.style.display = 'block';
		rsvpComing.style.display = 'none';
		rsvpForm.style.display = 'none';
		rsvpSad.style.display = 'none';

		renderRSVPDetails();
	} else if (data.is_coming === false) {
		rsvpSubmitted.style.display = 'none';
		rsvpComing.style.display = 'none';
		rsvpForm.style.display = 'none';
		rsvpSad.style.display = 'block';
	} else {
		rsvpSubmitted.style.display = 'none';
		rsvpComing.style.display = 'block';
		rsvpForm.style.display = 'none';
		rsvpSad.style.display = 'none';
	}
}

rsvpFind.addEventListener('submit', async event => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const key = formData.get('key');

	showRSVP(key);
});

const queryParams = new URLSearchParams(window.location.search);
const key = queryParams.get('key');

rsvpFind.querySelector('input[name=key]').value = key;

if (key && key !== 'null') {
	showRSVP(key);
} else {
	const storedKey = localStorage.getItem('rsvp-key');

	if (key && storedKey !== 'null') {
		showRSVP(storedKey);
	}
}

const today = new Date();
// const weddingDate = new Date('2024-11-09T00:00:00Z');
const weddingDate = new Date('2025-06-28T15:00:00Z');
const daysUntilTheWedding = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));
const span = countdown.querySelector('span');


if (daysUntilTheWedding === 1) {
	countdown.textContent = 'Tomorrow is the big day!';
} else if (daysUntilTheWedding === 0) {
	countdown.textContent = 'Today is the big day!';
} else if (daysUntilTheWedding > 0) {
	span.textContent = daysUntilTheWedding;
} else {
	countdown.textContent = 'The big day was ' + Math.abs(daysUntilTheWedding) + ' days ago!';
}
