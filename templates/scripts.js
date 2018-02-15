function toggleNextBlock(e) {
	document.getElementById(e.target.dataset.toggleElement).classList.toggle('expanded');
	if (e.target.dataset.toggleIcons === "true") {
		document.getElementById(e.target.dataset.toggleElement + 'plus-icon').classList.toggle('show');
		document.getElementById(e.target.dataset.toggleElement + 'minus-icon').classList.toggle('show');
		document.getElementById(e.target.dataset.toggleElement + 'plus-icon').classList.toggle('hide');
		document.getElementById(e.target.dataset.toggleElement + 'minus-icon').classList.toggle('hide');
	}
}